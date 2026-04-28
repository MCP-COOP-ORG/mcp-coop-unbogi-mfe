import {
  ERROR_CODES,
  ERROR_MESSAGES,
  FUNCTION_CONFIG,
  SendOtpSchema,
  TelegramAuthSchema,
  VerifyOtpSchema,
} from '@unbogi/contracts';
import { defineSecret } from 'firebase-functions/params';
import { type FunctionsErrorCode, HttpsError, onCall } from 'firebase-functions/v2/https';
import { OtpRepository, UserRepository } from '../repositories';
import { AuthService } from '../services';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const resendApiKey = defineSecret('RESEND_API_KEY');

// Dependencies composed at module level (singleton per cold-start)
const authService = new AuthService(new UserRepository(), new OtpRepository());

/** Authenticates a Telegram user via initData HMAC. Issues a Custom Token for known users. */
export const telegramAuth = onCall(
  { secrets: [telegramBotToken], region: FUNCTION_CONFIG.REGION, enforceAppCheck: FUNCTION_CONFIG.ENFORCE_APP_CHECK },
  async (request) => {
    const parsed = TelegramAuthSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    let botToken: string;
    try {
      botToken = telegramBotToken.value().trim();
    } catch {
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }

    return authService.authenticateWithTelegram(parsed.data, botToken);
  },
);

/** Sends an OTP code to the provided email address. Idempotent for active OTPs. */
export const sendEmailOtp = onCall(
  {
    secrets: [telegramBotToken, resendApiKey],
    region: FUNCTION_CONFIG.REGION,
    enforceAppCheck: FUNCTION_CONFIG.ENFORCE_APP_CHECK,
  },
  async (request) => {
    const parsed = SendOtpSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }

    let botToken: string;
    let apiKey: string;
    try {
      botToken = telegramBotToken.value().trim();
      apiKey = resendApiKey.value().trim();
    } catch {
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }

    await authService.sendEmailOtp(parsed.data, botToken, apiKey);
    return { success: true };
  },
);

/** Verifies an OTP code and completes registration. Returns a Firebase Custom Token. */
export const verifyEmailOtp = onCall(
  { region: FUNCTION_CONFIG.REGION, enforceAppCheck: FUNCTION_CONFIG.ENFORCE_APP_CHECK },
  async (request) => {
    const parsed = VerifyOtpSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    return authService.verifyEmailOtp(parsed.data);
  },
);
