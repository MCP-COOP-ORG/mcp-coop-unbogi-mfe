import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { 
  TelegramAuthRequest, 
  SendOtpRequest, 
  VerifyOtpRequest,
  AuthResponse,
  CONFIG,
  TELEGRAM_CONSTANTS,
  PROVIDERS,
  ERROR_MESSAGES,
  ERROR_CODES,
  COLLECTIONS,
  EMAILS,
  FIREBASE_ERRORS
} from '@unbogi/contracts';
import { HttpsError } from 'firebase-functions/v2/https';
import { UserRepository } from '../repositories/user';
import { Resend } from 'resend';
import { isFirebaseError } from '../utils/errors';
import * as logger from 'firebase-functions/logger';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async authenticateWithTelegram(payload: TelegramAuthRequest, botToken: string): Promise<AuthResponse> {
    const { initData } = payload;
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get(TELEGRAM_CONSTANTS.HASH_PARAM);

    if (!hash) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    urlParams.delete(TELEGRAM_CONSTANTS.HASH_PARAM);

    // Sort keys alphabetically using strict ASCII comparison
    const keys = Array.from(urlParams.keys()).sort((a, b) => a < b ? -1 : (a > b ? 1 : 0));
    const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n');
    
    const validParams = keys.map(key => ({ key, value: urlParams.get(key) as string }));

    const secretKey = crypto.createHmac(TELEGRAM_CONSTANTS.ALGO, CONFIG.TG_HMAC_CONSTANT).update(botToken).digest();
    const calculatedHash = crypto.createHmac(TELEGRAM_CONSTANTS.ALGO, secretKey).update(dataCheckString).digest(TELEGRAM_CONSTANTS.ENCODING);

    const hashBuffer = Buffer.from(hash, TELEGRAM_CONSTANTS.ENCODING);
    const calcBuffer = Buffer.from(calculatedHash, TELEGRAM_CONSTANTS.ENCODING);
    
    if (hashBuffer.length !== calcBuffer.length || !crypto.timingSafeEqual(hashBuffer, calcBuffer)) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.INVALID_TG_SIGNATURE);
    }

    const userParamObj = validParams.find(p => p.key === TELEGRAM_CONSTANTS.USER_PARAM);
    const userStr = userParamObj ? userParamObj.value : undefined;
    if (!userStr) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.TG_USER_NOT_FOUND);
    }

    let tgUser;
    try {
      tgUser = JSON.parse(userStr);
    } catch {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    
    const uid = `${TELEGRAM_CONSTANTS.UID_PREFIX}${tgUser.id}`;

    await this.userRepository.upsertUser(uid, {
      uid,
      nickname: tgUser.username || tgUser.first_name || TELEGRAM_CONSTANTS.DEFAULT_NICKNAME,
      telegramId: tgUser.id,
      provider: PROVIDERS.TELEGRAM,
    });

    const customToken = await admin.auth().createCustomToken(uid);
    return { token: customToken };
  }

  async sendEmailOtp(payload: SendOtpRequest, resendApiKey: string): Promise<void> {
    const { email } = payload;
    
    const otpCode = crypto.randomInt(100_000, 999_999).toString();
    const expiresAt = new Date(Date.now() + CONFIG.OTP_LIFETIME_MS);

    const db = admin.firestore();
    await db.doc(`${COLLECTIONS.SYSTEM_OTP}/${email}`).set({
      code: otpCode,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
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
      throw new HttpsError(ERROR_CODES.INTERNAL as any, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
    }
  }

  async verifyEmailOtp(payload: VerifyOtpRequest): Promise<AuthResponse> {
    const { email, code } = payload;
    const db = admin.firestore();
    
    const otpRef = db.doc(`${COLLECTIONS.SYSTEM_OTP}/${email}`);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      throw new HttpsError(ERROR_CODES.NOT_FOUND as any, ERROR_MESSAGES.NO_PENDING_OTP);
    }

    const data = otpDoc.data();

    if (!data || (data.attempts || 0) >= CONFIG.MAX_OTP_ATTEMPTS) {
      await otpRef.delete();
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED);
    }

    if (data.code !== code) {
      await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.INVALID_OTP);
    }

    if (data.expiresAt.toDate() < new Date()) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.EXPIRED_OTP);
    }

    await otpRef.delete();

    try {
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
      } catch (err: unknown) {
        if (isFirebaseError(err) && err.code === FIREBASE_ERRORS.USER_NOT_FOUND) {
          try {
            userRecord = await admin.auth().createUser({ email });
          } catch (createErr) {
            logger.error('[verifyEmailOtp] Error creating user:', createErr);
            throw new HttpsError(ERROR_CODES.INTERNAL as any, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
          }
        } else {
          logger.error('[verifyEmailOtp] Error getting user by email:', err);
          throw new HttpsError(ERROR_CODES.INTERNAL as any, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
        }
      }

      const uid = userRecord.uid;
      
      await this.userRepository.upsertUser(uid, {
        uid,
        email,
        provider: PROVIDERS.EMAIL,
      });

      const customToken = await admin.auth().createCustomToken(uid);
      return { token: customToken };
    } catch (err: unknown) {
      if (err instanceof HttpsError) throw err;
      logger.error('[verifyEmailOtp] Unhandled error after OTP match:', err);
      throw new HttpsError(ERROR_CODES.INTERNAL as any, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }
}
