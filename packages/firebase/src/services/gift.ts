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
import { AppError } from '../utils/errors';
import { mapTimestamp, resolveStorageUrl } from '../utils/storage';

export class GiftService {
  constructor(
    private readonly giftRepo: GiftRepository,
    private readonly contactRepo: ContactRepository,
    private readonly holidayRepo: HolidayRepository,
  ) {}

  /**
   * Sends a gift from `senderId` to `receiverId`.
   * Validates: no self-gift, receiver is a contact, holiday exists.
   * Idempotent via `idempotencyKey`.
   */
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

    const created = await this.giftRepo.createGift(idempotencyKey, {
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

    if (created) {
      logger.info(`[GiftService] Gift ${idempotencyKey} sent from ${senderId} to ${receiverId}`);
    } else {
      logger.info(`[GiftService] Duplicate request for key ${idempotencyKey}, returning existing id`);
    }

    return { giftId: idempotencyKey };
  }

  /** Scratches (opens) a gift. Only the receiver may do so. */
  async scratchGift(payload: ScratchGiftRequest, callerId: string): Promise<{ success: boolean }> {
    try {
      await this.giftRepo.scratchGift(payload.giftId, callerId);
      logger.info(`[GiftService] Gift ${payload.giftId} scratched by ${callerId}`);
      return { success: true };
    } catch (err: unknown) {
      if (err instanceof HttpsError) throw err;
      // Type-safe error routing via AppError.code — avoids fragile string comparison
      if (err instanceof AppError) {
        if (err.code === 'not-found') {
          throw new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, GIFT_ERROR_MESSAGES.GIFT_NOT_FOUND);
        }
        if (err.code === 'permission-denied') {
          throw new HttpsError(ERROR_CODES.PERMISSION_DENIED as FunctionsErrorCode, GIFT_ERROR_MESSAGES.GIFT_ACCESS_DENIED);
        }
      }
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }

  /** Returns all scratched gifts for a user. */
  async getOpenedGifts(userId: string) {
    const snap = await this.giftRepo.getOpenedGifts(userId);
    return this.mapGiftDocs(snap.docs);
  }

  /** Returns all unscratched (received but not opened) gifts for a user. */
  async getReceivedGifts(userId: string) {
    const snap = await this.giftRepo.getReceivedGifts(userId);
    return this.mapGiftDocs(snap.docs);
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /** Maps Firestore gift documents to a serialisable response shape. */
  private async mapGiftDocs(docs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]) {
    return Promise.all(
      docs.map(async (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          holidayId: data.holidayId,
          imageUrl: await resolveStorageUrl(data.imageUrl),
          greeting: data.greeting,
          unpackDate: mapTimestamp(data.unpackDate),
          scratchCode: data.scratchCode,
          scratchedAt: mapTimestamp(data.scratchedAt),
          createdAt: mapTimestamp(data.createdAt),
        };
      }),
    );
  }
}
