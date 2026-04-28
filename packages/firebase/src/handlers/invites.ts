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
import { InviteRepository, OtpRepository, UserRepository } from '../repositories';
import { AuthService, InviteService } from '../services';
import { errorToHttpsError } from '../utils';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const telegramBotUsername = defineSecret('TELEGRAM_BOT_USERNAME');
const resendApiKey = defineSecret('RESEND_API_KEY');

// Dependencies composed at module level (singleton per cold-start)
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, new OtpRepository());
const inviteService = new InviteService(new InviteRepository(), userRepository, authService);

/** Creates an invite link for the authenticated user. */
export const create = onCall(
  { region: FUNCTION_CONFIG.REGION, enforceAppCheck: FUNCTION_CONFIG.ENFORCE_APP_CHECK },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    const parsed = CreateInviteSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    const senderId = request.auth.uid;
    const result = await inviteService.createInvite(senderId, parsed.data);

    logger.info(`[invites.create] Invite created by ${senderId}, token: ${result.token}`);
    return result;
  },
);

/** Accepts a link-based invite and creates bidirectional contacts. */
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
    logger.info(`[invites.accept] Invite ${parsed.data.token} accepted by ${acceptorId}`);
    return result;
  } catch (err) {
    logger.error('[invites.accept] Failed to accept invite:', err);
    throw errorToHttpsError(err);
  }
});

/** Sends an email invite on behalf of the authenticated user. */
export const sendEmailInvite = onCall(
  {
    secrets: [telegramBotUsername, resendApiKey],
    region: FUNCTION_CONFIG.REGION,
    enforceAppCheck: FUNCTION_CONFIG.ENFORCE_APP_CHECK,
  },
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
      logger.info(`[invites.sendEmailInvite] Email sent by ${senderId} to ${parsed.data.targetEmail}`);
      return result;
    } catch (err) {
      logger.error('[invites.sendEmailInvite] Failed to send email invite:', err);
      throw errorToHttpsError(err);
    }
  },
);

/** Redeems an email invite token via Telegram initData and returns a Firebase Custom Token. */
export const redeemEmailInvite = onCall(
  { secrets: [telegramBotToken], region: FUNCTION_CONFIG.REGION, enforceAppCheck: FUNCTION_CONFIG.ENFORCE_APP_CHECK },
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
      logger.info(`[invites.redeemEmailInvite] Invite ${parsed.data.inviteToken} redeemed`);
      return result;
    } catch (err) {
      logger.error('[invites.redeemEmailInvite] Failed to redeem invite:', err);
      throw errorToHttpsError(err);
    }
  },
);
