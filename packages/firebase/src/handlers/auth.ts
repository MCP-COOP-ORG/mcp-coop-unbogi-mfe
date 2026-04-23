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
import { UserRepository } from '../repositories/user';
import { AuthService } from '../services/auth';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const resendApiKey = defineSecret('RESEND_API_KEY');

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const telegramAuth = onCall({ secrets: [telegramBotToken], region: FUNCTION_CONFIG.REGION }, async (request) => {
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

  // Возвращает { token?, hasEmail } — token только если пользователь уже зарегистрирован
  return await authService.authenticateWithTelegram(parsed.data, botToken);
});

export const sendEmailOtp = onCall(
  // botToken нужен для валидации initData внутри sendEmailOtp
  { secrets: [telegramBotToken, resendApiKey], region: FUNCTION_CONFIG.REGION },
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

export const verifyEmailOtp = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  const parsed = VerifyOtpSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  return await authService.verifyEmailOtp(parsed.data);
});
