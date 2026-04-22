import {
  AcceptInviteSchema,
  CreateInviteSchema,
  ERROR_CODES,
  ERROR_MESSAGES,
  FUNCTION_CONFIG,
} from '@unbogi/contracts';
import { logger } from 'firebase-functions/v2';
import { type FunctionsErrorCode, HttpsError, onCall } from 'firebase-functions/v2/https';
import { InviteService } from '../services/invite';

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
