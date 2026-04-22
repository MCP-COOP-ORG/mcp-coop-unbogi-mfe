'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthService = void 0;
const admin = __importStar(require('firebase-admin'));
const crypto = __importStar(require('crypto'));
const contracts_1 = require('@unbogi/contracts');
const https_1 = require('firebase-functions/v2/https');
const resend_1 = require('resend');
const errors_1 = require('../utils/errors');
const logger = __importStar(require('firebase-functions/logger'));
class AuthService {
  userRepository;
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  /**
   * Общая логика валидации Telegram initData и извлечения TgUser.
   * Переиспользуется в telegramAuth и sendEmailOtp.
   */
  validateAndExtractUser(initData, botToken) {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get(contracts_1.TELEGRAM_CONSTANTS.HASH_PARAM);
    if (!hash) {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.INVALID_ARGUMENT,
        contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD,
      );
    }
    urlParams.delete(contracts_1.TELEGRAM_CONSTANTS.HASH_PARAM);
    const keys = Array.from(urlParams.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n');
    const secretKey = crypto
      .createHmac(contracts_1.TELEGRAM_CONSTANTS.ALGO, contracts_1.CONFIG.TG_HMAC_CONSTANT)
      .update(botToken)
      .digest();
    const calculatedHash = crypto
      .createHmac(contracts_1.TELEGRAM_CONSTANTS.ALGO, secretKey)
      .update(dataCheckString)
      .digest(contracts_1.TELEGRAM_CONSTANTS.ENCODING);
    const hashBuffer = Buffer.from(hash, contracts_1.TELEGRAM_CONSTANTS.ENCODING);
    const calcBuffer = Buffer.from(calculatedHash, contracts_1.TELEGRAM_CONSTANTS.ENCODING);
    if (hashBuffer.length !== calcBuffer.length || !crypto.timingSafeEqual(hashBuffer, calcBuffer)) {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.UNAUTHENTICATED,
        contracts_1.ERROR_MESSAGES.INVALID_TG_SIGNATURE,
      );
    }
    const userStr = urlParams.get(contracts_1.TELEGRAM_CONSTANTS.USER_PARAM);
    if (!userStr) {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.INVALID_ARGUMENT,
        contracts_1.ERROR_MESSAGES.TG_USER_NOT_FOUND,
      );
    }
    try {
      return JSON.parse(userStr);
    } catch {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.INVALID_ARGUMENT,
        contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD,
      );
    }
  }
  /**
   * Telegram auth bootstrapping:
   * - Валидирует HMAC подпись
   * - Ищет пользователя по telegramId (ТОЛЬКО ЧТЕНИЕ — в базу не пишем без email)
   * - Если найден: выдаёт custom token
   * - Если не найден: возвращает { hasEmail: false } без токена
   */
  async authenticateWithTelegram(payload, botToken) {
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
  async sendEmailOtp(payload, botToken, resendApiKey) {
    const { email, initData } = payload;
    // Валидируем Telegram подпись и извлекаем пользователя
    const tgUser = this.validateAndExtractUser(initData, botToken);
    const nickname = tgUser.username || tgUser.first_name || contracts_1.TELEGRAM_CONSTANTS.DEFAULT_NICKNAME;
    const db = admin.firestore();
    const otpRef = db.doc(`${contracts_1.COLLECTIONS.SYSTEM_OTP}/${email}`);
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
    const expiresAt = new Date(Date.now() + contracts_1.CONFIG.OTP_LIFETIME_MS);
    await otpRef.set({
      code: otpCode,
      attempts: 0,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      telegramId: tgUser.id,
      nickname,
    });
    const resend = new resend_1.Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: contracts_1.EMAILS.SENDER,
      to: email,
      subject: contracts_1.EMAILS.SUBJECT_OTP,
      html: contracts_1.EMAILS.TEMPLATE_OTP(otpCode),
    });
    if (error) {
      logger.error('Resend API Error:', error);
      throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
    }
  }
  /**
   * Верифицирует OTP и завершает регистрацию:
   * - Читает telegramId + nickname из OTP-записи
   * - Создаёт или находит Firebase Auth user по email
   * - Записывает полный профиль в Firestore users/{uid} (email + telegramId + nickname)
   * - Выдаёт custom token для signInWithCustomToken
   */
  async verifyEmailOtp(payload) {
    const { email, code } = payload;
    const db = admin.firestore();
    const otpRef = db.doc(`${contracts_1.COLLECTIONS.SYSTEM_OTP}/${email}`);
    const otpDoc = await otpRef.get();
    if (!otpDoc.exists) {
      throw new https_1.HttpsError(contracts_1.ERROR_CODES.NOT_FOUND, contracts_1.ERROR_MESSAGES.NO_PENDING_OTP);
    }
    const data = otpDoc.data();
    if (!data || (data.attempts || 0) >= contracts_1.CONFIG.MAX_OTP_ATTEMPTS) {
      await otpRef.delete();
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.UNAUTHENTICATED,
        contracts_1.ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED,
      );
    }
    if (data.code !== code) {
      await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
      throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.INVALID_OTP);
    }
    if (data.expiresAt.toDate() < new Date()) {
      await otpRef.delete();
      throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.EXPIRED_OTP);
    }
    // Извлекаем telegramId и nickname из OTP-записи (сохранены при sendEmailOtp)
    const { telegramId, nickname } = data;
    await otpRef.delete();
    try {
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
      } catch (err) {
        if ((0, errors_1.isFirebaseError)(err) && err.code === contracts_1.FIREBASE_ERRORS.USER_NOT_FOUND) {
          try {
            userRecord = await admin.auth().createUser({ email });
          } catch (createErr) {
            logger.error('[verifyEmailOtp] Error creating user:', createErr);
            throw new https_1.HttpsError(
              contracts_1.ERROR_CODES.INTERNAL,
              contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR,
            );
          }
        } else {
          logger.error('[verifyEmailOtp] Error getting user by email:', err);
          throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
        }
      }
      const uid = userRecord.uid;
      // Полный профиль: email (primary key) + telegramId (связка) + nickname (из TG)
      await this.userRepository.upsertUser(uid, {
        uid,
        email,
        telegramId,
        nickname,
        provider: contracts_1.PROVIDERS.EMAIL,
      });
      const customToken = await admin.auth().createCustomToken(uid);
      return { token: customToken };
    } catch (err) {
      if (err instanceof https_1.HttpsError) throw err;
      logger.error('[verifyEmailOtp] Unhandled error after OTP match:', err);
      throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map
