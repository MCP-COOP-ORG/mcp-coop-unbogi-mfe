import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { 
  SendGiftSchema, 
  ScratchGiftSchema, 
  ERROR_CODES, 
  ERROR_MESSAGES,
  FUNCTION_CONFIG 
} from '@unbogi/contracts';
import { GiftService } from '../services/gift';
import { GiftRepository } from '../repositories/gift';
import { ContactRepository } from '../repositories/contact';
import { HolidayRepository } from '../repositories/holiday';

const giftRepo = new GiftRepository();
const contactRepo = new ContactRepository();
const holidayRepo = new HolidayRepository();
const giftService = new GiftService(giftRepo, contactRepo, holidayRepo);

export const send = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    const parsed = SendGiftSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    return await giftService.sendGift(parsed.data, request.auth.uid);
  }
);

export const scratch = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    const parsed = ScratchGiftSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as any, ERROR_MESSAGES.INVALID_PAYLOAD);
    }

    return await giftService.scratchGift(parsed.data, request.auth.uid);
  }
);

export const getOpened = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    const gifts = await giftService.getOpenedGifts(request.auth.uid);
    return { gifts };
  }
);

export const getReceived = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    const gifts = await giftService.getReceivedGifts(request.auth.uid);
    return { gifts };
  }
);
