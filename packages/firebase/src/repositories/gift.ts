import { COLLECTIONS, FIREBASE_ERROR_CODES } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { AppError } from '../utils/errors';

interface GiftData {
  senderId: string;
  receiverId: string;
  holidayId: string;
  imageUrl: string;
  greeting: string;
  unpackDate: Date;
  scratchCode: { value: string; format: string };
  scratchedAt: admin.firestore.FieldValue | null;
  createdAt: admin.firestore.FieldValue;
}

export class GiftRepository {
  private get db() {
    return admin.firestore();
  }

  private get collection() {
    return this.db.collection(COLLECTIONS.GIFTS);
  }

  /**
   * Creates a gift document keyed by `idempotencyKey`.
   * Returns `true` on creation, `false` when the key already exists (duplicate).
   */
  async createGift(idempotencyKey: string, data: GiftData): Promise<boolean> {
    try {
      await this.collection.doc(idempotencyKey).create(data);
      return true;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === FIREBASE_ERROR_CODES.ALREADY_EXISTS) {
        return false;
      }
      throw err;
    }
  }

  /** Returns the raw Firestore snapshot for a single gift document. */
  async getGift(giftId: string): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
    return this.collection.doc(giftId).get();
  }

  /**
   * Marks a gift as scratched within a transaction.
   * Enforces ownership (only the receiver may scratch).
   * Idempotent: if already scratched, exits without error.
   */
  async scratchGift(giftId: string, callerId: string): Promise<void> {
    await this.db.runTransaction(async (tx) => {
      const giftRef = this.collection.doc(giftId);
      const giftSnap = await tx.get(giftRef);

      if (!giftSnap.exists) throw new AppError('not-found', 'Gift not found');

      const gift = giftSnap.data()!;

      if (gift.receiverId !== callerId) throw new AppError('permission-denied', 'Access denied');

      // Idempotent: already scratched → no-op
      if (gift.scratchedAt !== null) return;

      tx.update(giftRef, { scratchedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  }

  /** Returns the 50 most recently scratched gifts for a user, newest first. */
  async getOpenedGifts(userId: string) {
    return this.collection
      .where('receiverId', '==', userId)
      .where('scratchedAt', '!=', null)
      .orderBy('scratchedAt', 'desc')
      .limit(50)
      .get();
  }

  /** Returns up to 50 unscratched (received but not yet opened) gifts for a user. */
  async getReceivedGifts(userId: string) {
    return this.collection
      .where('receiverId', '==', userId)
      .where('scratchedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
  }
}
