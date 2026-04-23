import {
  AcceptInviteSchema,
  CreateInviteSchema,
  ERROR_CODES,
  ERROR_MESSAGES,
  FUNCTION_CONFIG,
  RedeemEmailInviteSchema,
  SendEmailInviteSchema,
} from '@unbogi/contracts';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { type FunctionsErrorCode, HttpsError, onCall } from 'firebase-functions/v2/https';
import { InviteService } from '../services/invite';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const telegramBotUsername = defineSecret('TELEGRAM_BOT_USERNAME');
const resendApiKey = defineSecret('RESEND_API_KEY');

const inviteService = new InviteService();

export const create = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const parsed = CreateInviteSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  const senderId = request.auth.uid;
  const result = await inviteService.createInvite(senderId, parsed.data);

  logger.info(`Invite created by ${senderId}, token: ${result.token}`);
  return result;
});

export const accept = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const parsed = AcceptInviteSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  const acceptorId = request.auth.uid;

  try {
    const result = await inviteService.acceptInvite(acceptorId, parsed.data);
    logger.info(`Invite ${parsed.data.token} accepted by ${acceptorId}`);
    return result;
  } catch (error: unknown) {
    logger.error(`Failed to accept invite:`, error);
    // Convert ApplicationError to HttpsError
    const code =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : String(ERROR_CODES.INTERNAL);
    const message = error instanceof Error ? error.message : String(error);
    throw new HttpsError(code as FunctionsErrorCode, message);
  }
});

export const sendEmailInvite = onCall(
  { secrets: [telegramBotUsername, resendApiKey], region: FUNCTION_CONFIG.REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    const parsed = SendEmailInviteSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    const senderId = request.auth.uid;
    let botUsername: string;
    let apiKey: string;
    try {
      botUsername = telegramBotUsername.value().trim();
      apiKey = resendApiKey.value().trim();
    } catch {
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }

    try {
      const result = await inviteService.sendEmailInvite(senderId, parsed.data, botUsername, apiKey);
      logger.info(`Email invite sent by ${senderId} to ${parsed.data.targetEmail}`);
      return result;
    } catch (error: unknown) {
      logger.error(`Failed to send email invite:`, error);
      const code =
        error && typeof error === 'object' && 'code' in error ? String(error.code) : String(ERROR_CODES.INTERNAL);
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpsError(code as FunctionsErrorCode, message);
    }
  },
);

export const redeemEmailInvite = onCall(
  { secrets: [telegramBotToken], region: FUNCTION_CONFIG.REGION },
  async (request) => {
    const parsed = RedeemEmailInviteSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    let botToken: string;
    try {
      botToken = telegramBotToken.value().trim();
    } catch {
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }

    try {
      const result = await inviteService.redeemEmailInvite(parsed.data, botToken);
      logger.info(`Email invite ${parsed.data.inviteToken} redeemed`);
      return result;
    } catch (error: unknown) {
      logger.error(`Failed to redeem email invite:`, error);
      const code =
        error && typeof error === 'object' && 'code' in error ? String(error.code) : String(ERROR_CODES.INTERNAL);
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpsError(code as FunctionsErrorCode, message);
    }
  },
);
