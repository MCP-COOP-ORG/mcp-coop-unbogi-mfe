import * as crypto from 'node:crypto';
import {
  type AuthResponse,
  COLLECTIONS,
  CONFIG,
  EMAILS,
  ERROR_CODES,
  ERROR_MESSAGES,
  FIREBASE_ERRORS,
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
import type { UserRepository } from '../repositories/user';
import { isFirebaseError } from '../utils/errors';

interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Общая логика валидации Telegram initData и извлечения TgUser.
   * Переиспользуется в telegramAuth, sendEmailOtp и redeemEmailInvite.
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
   * Telegram auth bootstrapping:
   * - Валидирует HMAC подпись
   * - Ищет пользователя по telegramId (ТОЛЬКО ЧТЕНИЕ — в базу не пишем без email)
   * - Если найден: выдаёт custom token
   * - Если не найден: возвращает { hasEmail: false } без токена
   */
  async authenticateWithTelegram(payload: TelegramAuthRequest, botToken: string): Promise<TelegramAuthResponse> {
    const tgUser = this.validateAndExtractUser(payload.initData, botToken);

    const existingUser = await this.userRepository.findByTelegramId(tgUser.id);

    if (existingUser) {
      const customToken = await admin.auth().createCustomToken(existingUser.uid);
      return { token: customToken, hasEmail: true };
    }

    // Пользователь не найден — OTP регистрация нужна
    // В базу ничего не пишем
    return { hasEmail: false };
  }

  /**
   * Отправляет OTP на email:
   * - Валидирует initData (HMAC) — для извлечения telegramId и nickname
   * - Если активный OTP для этого email уже существует — не высылаем новый (идемпотентность)
   * - Сохраняет telegramId + nickname в OTP-запись для последующей связки
   */
  async sendEmailOtp(payload: SendOtpRequest, botToken: string, resendApiKey: string): Promise<void> {
    const { email, initData } = payload;

    // Валидируем Telegram подпись и извлекаем пользователя
    const tgUser = this.validateAndExtractUser(initData, botToken);
    const nickname = tgUser.username || tgUser.first_name || TELEGRAM_CONSTANTS.DEFAULT_NICKNAME;

    const db = admin.firestore();
    const otpRef = db.doc(`${COLLECTIONS.SYSTEM_OTP}/${email}`);

    // Идемпотентность: если OTP для этого email ещё активен — не высылаем новый
    const existing = await otpRef.get();
    if (existing.exists) {
      const data = existing.data();
      if (data?.expiresAt?.toDate() > new Date()) {
        // OTP ещё жив — клиент переключит UI по своему otpSentAt без нового запроса
        logger.info('[sendEmailOtp] Active OTP already exists for email, skipping resend');
        return;
      }
    }

    const otpCode = crypto.randomInt(100_000, 999_999).toString();
    const expiresAt = new Date(Date.now() + CONFIG.OTP_LIFETIME_MS);

    await otpRef.set({
      code: otpCode,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      telegramId: tgUser.id,
      nickname,
    });

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: EMAILS.SENDER,
      to: email,
      subject: EMAILS.SUBJECT_OTP,
      html: EMAILS.TEMPLATE_OTP(otpCode),
    });

    if (error) {
      logger.error('Resend API Error:', error);
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
    }
  }

  /**
   * Верифицирует OTP и завершает регистрацию:
   * - Читает telegramId + nickname из OTP-записи
   * - Создаёт или находит Firebase Auth user по email
   * - Записывает полный профиль в Firestore users/{uid} (email + telegramId + nickname)
   * - Выдаёт custom token для signInWithCustomToken
   */
  async verifyEmailOtp(payload: VerifyOtpRequest): Promise<AuthResponse> {
    const { email, code } = payload;
    const db = admin.firestore();

    const otpRef = db.doc(`${COLLECTIONS.SYSTEM_OTP}/${email}`);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      throw new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, ERROR_MESSAGES.NO_PENDING_OTP);
    }

    const data = otpDoc.data();

    if (!data || (data.attempts || 0) >= CONFIG.MAX_OTP_ATTEMPTS) {
      await otpRef.delete();
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED);
    }

    if (data.code !== code) {
      await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.INVALID_OTP);
    }

    if (data.expiresAt.toDate() < new Date()) {
      await otpRef.delete();
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.EXPIRED_OTP);
    }

    // Извлекаем telegramId и nickname из OTP-записи (сохранены при sendEmailOtp)
    const { telegramId, nickname } = data as { telegramId: number; nickname: string };

    await otpRef.delete();

    try {
      let userRecord: admin.auth.UserRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
      } catch (err: unknown) {
        if (isFirebaseError(err) && err.code === FIREBASE_ERRORS.USER_NOT_FOUND) {
          try {
            userRecord = await admin.auth().createUser({ email });
          } catch (createErr) {
            logger.error('[verifyEmailOtp] Error creating user:', createErr);
            throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
          }
        } else {
          logger.error('[verifyEmailOtp] Error getting user by email:', err);
          throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
        }
      }

      const uid = userRecord.uid;

      // Полный профиль: email (primary key) + telegramId (связка) + nickname (из TG)
      await this.userRepository.upsertUser(uid, {
        uid,
        email,
        telegramId,
        nickname,
        provider: PROVIDERS.EMAIL,
      });

      const customToken = await admin.auth().createCustomToken(uid);
      return { token: customToken };
    } catch (err: unknown) {
      if (err instanceof HttpsError) throw err;
      logger.error('[verifyEmailOtp] Unhandled error after OTP match:', err);
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }
}
