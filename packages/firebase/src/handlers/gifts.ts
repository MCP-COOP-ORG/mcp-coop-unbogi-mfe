import { ERROR_CODES, ERROR_MESSAGES, FUNCTION_CONFIG, ScratchGiftSchema, SendGiftSchema } from '@unbogi/contracts';
import { type FunctionsErrorCode, HttpsError, onCall } from 'firebase-functions/v2/https';
import { ContactRepository, GiftRepository, HolidayRepository } from '../repositories';
import { GiftService } from '../services';

// Dependencies composed at module level (singleton per cold-start)
const giftService = new GiftService(new GiftRepository(), new ContactRepository(), new HolidayRepository());

/** Sends a gift to a contact. Idempotent via `idempotencyKey`. */
export const send = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const parsed = SendGiftSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  return giftService.sendGift(parsed.data, request.auth.uid);
});

/** Scratches (opens) a received gift. Only the receiver may do so. */
export const scratch = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const parsed = ScratchGiftSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  return giftService.scratchGift(parsed.data, request.auth.uid);
});

/** Returns all scratched gifts for the authenticated user. */
export const getOpened = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const gifts = await giftService.getOpenedGifts(request.auth.uid);
  return { gifts };
});

/** Returns all unscratched received gifts for the authenticated user. */
export const getReceived = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  const gifts = await giftService.getReceivedGifts(request.auth.uid);
  return { gifts };
});
