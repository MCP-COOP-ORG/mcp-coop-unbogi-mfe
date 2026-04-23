import {
  ERROR_CODES,
  ERROR_MESSAGES,
  GIFT_ERROR_MESSAGES,
  type ScratchGiftRequest,
  type SendGiftRequest,
} from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';
import type { ContactRepository } from '../repositories/contact';
import type { GiftRepository } from '../repositories/gift';
import type { HolidayRepository } from '../repositories/holiday';
import { resolveStorageUrl } from '../utils/storage';

export class GiftService {
  constructor(
    private giftRepo: GiftRepository,
    private contactRepo: ContactRepository,
    private holidayRepo: HolidayRepository,
  ) {}

  async sendGift(payload: SendGiftRequest, senderId: string): Promise<{ giftId: string }> {
    const { idempotencyKey, receiverId, holidayId, greeting, unpackDate, scratchCode } = payload;

    if (senderId === receiverId) {
      throw new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, GIFT_ERROR_MESSAGES.SELF_GIFT_FORBIDDEN);
    }

    const areConnected = await this.contactRepo.areUsersConnected(senderId, receiverId);
    if (!areConnected) {
      throw new HttpsError(
        ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode,
        GIFT_ERROR_MESSAGES.RECEIVER_NOT_IN_CONTACTS,
      );
    }

    const holidaySnap = await this.holidayRepo.getHoliday(holidayId);
    if (!holidaySnap.exists) {
      throw new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, GIFT_ERROR_MESSAGES.HOLIDAY_NOT_FOUND);
    }

    const holiday = holidaySnap.data()!;

    const success = await this.giftRepo.createGift(idempotencyKey, {
      senderId,
      receiverId,
      holidayId,
      imageUrl: typeof holiday.imageUrl === 'string' ? holiday.imageUrl : '',
      greeting,
      unpackDate: new Date(unpackDate),
      scratchCode,
      scratchedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (!success) {
      logger.info(`Duplicate gift request for key ${idempotencyKey}, returning existing id.`);
    } else {
      logger.info(`Gift ${idempotencyKey} sent from ${senderId} to ${receiverId}`);
    }

    return { giftId: idempotencyKey };
  }

  async scratchGift(payload: ScratchGiftRequest, callerId: string): Promise<{ success: boolean }> {
    try {
      await this.giftRepo.scratchGift(payload.giftId, callerId);
      logger.info(`Gift ${payload.giftId} scratched by ${callerId}`);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === 'NOT_FOUND') {
        throw new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, GIFT_ERROR_MESSAGES.GIFT_NOT_FOUND);
      }
      if (message === 'PERMISSION_DENIED') {
        throw new HttpsError(
          ERROR_CODES.PERMISSION_DENIED as FunctionsErrorCode,
          GIFT_ERROR_MESSAGES.GIFT_ACCESS_DENIED,
        );
      }
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }

  async getOpenedGifts(userId: string) {
    const snap = await this.giftRepo.getOpenedGifts(userId);
    return await this.mapGiftDocs(snap.docs);
  }

  async getReceivedGifts(userId: string) {
    const snap = await this.giftRepo.getReceivedGifts(userId);
    return await this.mapGiftDocs(snap.docs);
  }

  private async mapGiftDocs(docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]) {
    return Promise.all(
      docs.map(async (doc) => {
        const data = doc.data();
        const resolvedImageUrl = await resolveStorageUrl(data.imageUrl);

        return {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          holidayId: data.holidayId,
          imageUrl: resolvedImageUrl,
          greeting: data.greeting,
          unpackDate: data.unpackDate?.toDate()?.toISOString(),
          scratchCode: data.scratchCode,
          scratchedAt: data.scratchedAt?.toDate()?.toISOString(),
          createdAt: data.createdAt?.toDate()?.toISOString(),
        };
      }),
    );
  }
}
