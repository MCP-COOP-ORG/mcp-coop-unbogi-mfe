import { COLLECTIONS, FIREBASE_ERROR_CODES } from '@unbogi/contracts';
import * as admin from 'firebase-admin';

interface GiftData {
  senderId: string;
  receiverId: string;
  holidayId: string;
  imageUrl: string;
  greeting: string;
  unpackDate: Date;
  scratchCode: {
    value: string;
    format: string;
  };
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

  async getGift(giftId: string): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
    return await this.collection.doc(giftId).get();
  }

  async scratchGift(giftId: string, callerId: string): Promise<void> {
    await this.db.runTransaction(async (tx) => {
      const giftRef = this.collection.doc(giftId);
      const giftSnap = await tx.get(giftRef);

      if (!giftSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const gift = giftSnap.data()!;

      if (gift.receiverId !== callerId) {
        throw new Error('PERMISSION_DENIED');
      }

      if (gift.scratchedAt !== null) {
        return;
      }

      tx.update(giftRef, {
        scratchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  }

  async getOpenedGifts(userId: string) {
    return await this.collection
      .where('receiverId', '==', userId)
      .where('scratchedAt', '!=', null)
      .orderBy('scratchedAt', 'desc')
      .limit(50)
      .get();
  }

  async getReceivedGifts(userId: string) {
    return await this.collection
      .where('receiverId', '==', userId)
      .where('scratchedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
  }
}
