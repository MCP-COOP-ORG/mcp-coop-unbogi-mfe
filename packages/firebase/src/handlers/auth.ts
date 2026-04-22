import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as functions from 'firebase-functions/v2';
import { 
  TelegramAuthSchema, 
  SendOtpSchema, 
  VerifyOtpSchema,
  ERROR_CODES,
  ERROR_MESSAGES,
  FUNCTION_CONFIG
} from '@unbogi/contracts';
import { AuthService } from '../services/auth';
import { UserRepository } from '../repositories/user';

const telegramBotToken = functions.params.defineSecret('TELEGRAM_BOT_TOKEN');
const resendApiKey = functions.params.defineSecret('RESEND_API_KEY');

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const telegramAuth = onCall(
  { secrets: [telegramBotToken], region: FUNCTION_CONFIG.REGION },
  async (request) => {
    const parsed = TelegramAuthSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    let botToken: string;
    try {
      botToken = telegramBotToken.value().trim();
    } catch (e) {
      throw new HttpsError(ERROR_CODES.INTERNAL as any, ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }

    return await authService.authenticateWithTelegram(parsed.data, botToken);
  }
);

export const sendEmailOtp = onCall(
  { secrets: [resendApiKey], region: FUNCTION_CONFIG.REGION },
  async (request) => {
    const parsed = SendOtpSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }

    let apiKey: string;
    try {
      apiKey = resendApiKey.value().trim();
    } catch (e) {
      throw new HttpsError(ERROR_CODES.INTERNAL as any, 'Server configuration error: Resend API Key not found');
    }

    await authService.sendEmailOtp(parsed.data, apiKey);
    return { success: true };
  }
);

export const verifyEmailOtp = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async (request) => {
    const parsed = VerifyOtpSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    return await authService.verifyEmailOtp(parsed.data);
  }
);
