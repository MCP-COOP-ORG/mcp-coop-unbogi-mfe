import * as crypto from 'node:crypto';
import {
  type AuthResponse,
  CONFIG,
  EMAILS,
  ERROR_CODES,
  ERROR_MESSAGES,
  PROVIDERS,
  type SendOtpRequest,
  TELEGRAM_CONSTANTS,
  type TelegramAuthRequest,
  type TelegramAuthResponse,
  type VerifyOtpRequest,
} from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';
import { Resend } from 'resend';
import type { OtpRepository } from '../repositories/otp';
import type { UserRepository } from '../repositories/user';
import { getOrCreateFirebaseUser } from '../utils/firebase-auth';

// ─── Internal Types ───────────────────────────────────────────────────────────

interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
  ) {}

  /**
   * Validates a Telegram `initData` HMAC signature and extracts the embedded user object.
   * Reused by `authenticateWithTelegram`, `sendEmailOtp`, and `InviteService.redeemEmailInvite`.
   */
  public validateAndExtractUser(initData: string, botToken: string): TgUser {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get(TELEGRAM_CONSTANTS.HASH_PARAM);

    if (!hash) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    urlParams.delete(TELEGRAM_CONSTANTS.HASH_PARAM);

    const keys = Array.from(urlParams.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n');

    const secretKey = crypto.createHmac(TELEGRAM_CONSTANTS.ALGO, CONFIG.TG_HMAC_CONSTANT).update(botToken).digest();
    const calculatedHash = crypto
      .createHmac(TELEGRAM_CONSTANTS.ALGO, secretKey)
      .update(dataCheckString)
      .digest(TELEGRAM_CONSTANTS.ENCODING);

    const hashBuffer = Buffer.from(hash, TELEGRAM_CONSTANTS.ENCODING);
    const calcBuffer = Buffer.from(calculatedHash, TELEGRAM_CONSTANTS.ENCODING);

    if (hashBuffer.length !== calcBuffer.length || !crypto.timingSafeEqual(hashBuffer, calcBuffer)) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.INVALID_TG_SIGNATURE);
    }

    const userStr = urlParams.get(TELEGRAM_CONSTANTS.USER_PARAM);
    if (!userStr) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.TG_USER_NOT_FOUND);
    }

    try {
      return JSON.parse(userStr) as TgUser;
    } catch {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }
  }

  /**
   * Telegram login:
   * - Validates HMAC signature.
   * - Looks up the user by `telegramId` (read-only — no writes without an email).
   * - Returns a custom token if the user exists, or `{ hasEmail: false }` to trigger OTP registration.
   */
  async authenticateWithTelegram(payload: TelegramAuthRequest, botToken: string): Promise<TelegramAuthResponse> {
    const tgUser = this.validateAndExtractUser(payload.initData, botToken);
    const existingUser = await this.userRepository.findByTelegramId(tgUser.id);

    if (existingUser) {
      const customToken = await admin.auth().createCustomToken(existingUser.uid);
      return { token: customToken, hasEmail: true };
    }

    // User not found — OTP registration required; nothing written to DB
    return { hasEmail: false };
  }

  /**
   * Sends an OTP to the provided email address:
   * - Validates Telegram `initData` to bind the `telegramId` to the OTP record.
   * - Idempotent: skips resend if an active OTP already exists for this email.
   * - Compensating write: OTP is persisted ONLY after the email is confirmed delivered.
   */
  async sendEmailOtp(payload: SendOtpRequest, botToken: string, resendApiKey: string): Promise<void> {
    const { email, initData } = payload;

    const tgUser = this.validateAndExtractUser(initData, botToken);
    const nickname = tgUser.username || tgUser.first_name || TELEGRAM_CONSTANTS.DEFAULT_NICKNAME;

    // Skip resend if a non-expired OTP already exists for this email
    const existing = await this.otpRepository.getOtp(email);
    const existingExpiry = existing?.expiresAt?.toDate();
    if (existingExpiry && existingExpiry > new Date()) {
      logger.info('[AuthService.sendEmailOtp] Active OTP already exists, skipping resend');
      return;
    }

    const otpCode = crypto.randomInt(100_000, 999_999).toString();
    const newExpiresAt = new Date(Date.now() + CONFIG.OTP_LIFETIME_MS);

    // ── Compensating write: send email FIRST, persist OTP only on success ────
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: EMAILS.SENDER,
      to: email,
      subject: EMAILS.SUBJECT_OTP,
      html: EMAILS.TEMPLATE_OTP(otpCode),
    });

    if (error) {
      // No OTP written — user can retry immediately without waiting for expiry
      logger.error('[AuthService.sendEmailOtp] Resend API error — OTP not persisted:', error);
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
    }

    await this.otpRepository.setOtp(email, {
      code: otpCode,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromDate(newExpiresAt),
      telegramId: tgUser.id,
      nickname,
    });
  }

  /**
   * Verifies the OTP and completes registration:
   * - Reads `telegramId` + `nickname` stored in the OTP record (set during `sendEmailOtp`).
   * - Gets or creates a Firebase Auth user.
   * - Upserts the full profile in Firestore.
   * - Returns a Firebase Custom Token.
   */
  async verifyEmailOtp(payload: VerifyOtpRequest): Promise<AuthResponse> {
    const { email, code } = payload;

    const data = await this.otpRepository.getOtp(email);

    if (!data) {
      throw new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, ERROR_MESSAGES.NO_PENDING_OTP);
    }

    if ((data.attempts || 0) >= CONFIG.MAX_OTP_ATTEMPTS) {
      await this.otpRepository.deleteOtp(email);
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED);
    }

    if (data.code !== code) {
      await this.otpRepository.incrementAttempts(email);
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.INVALID_OTP);
    }

    if (data.expiresAt.toDate() < new Date()) {
      await this.otpRepository.deleteOtp(email);
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.EXPIRED_OTP);
    }

    const { telegramId, nickname } = data;
    await this.otpRepository.deleteOtp(email);

    try {
      // Shared utility: get existing Firebase Auth user or create one
      const userRecord = await getOrCreateFirebaseUser(email);
      const uid = userRecord.uid;

      await this.userRepository.upsertUser(uid, { uid, email, telegramId, nickname, provider: PROVIDERS.EMAIL });

      const customToken = await admin.auth().createCustomToken(uid);
      return { token: customToken };
    } catch (err: unknown) {
      if (err instanceof HttpsError) throw err;
      logger.error('[AuthService.verifyEmailOtp] Unhandled error after OTP match:', err);
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }
}
