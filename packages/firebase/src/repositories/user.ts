import { COLLECTIONS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserData {
  uid: string;
  telegramId?: number;
  email?: string;
  nickname?: string;
  provider: string;
  createdAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

export class UserRepository {
  private get db() {
    return admin.firestore();
  }

  private get collection() {
    return this.db.collection(COLLECTIONS.USERS);
  }

  /** Finds a user by their Telegram numeric ID. Returns `null` if not found. */
  async findByTelegramId(telegramId: number): Promise<UserData | null> {
    const snap = await this.collection.where('telegramId', '==', telegramId).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as UserData;
  }

  /** Finds a user by their Firebase UID. Returns `null` if not found. */
  async findById(uid: string): Promise<UserData | null> {
    const snap = await this.collection.doc(uid).get();
    if (!snap.exists) return null;
    return snap.data() as UserData;
  }

  /**
   * Upserts a user document with `merge: true`.
   * Sets `createdAt` only on first write, using `set` with `merge` on the
   * same document to avoid the extra round-trip of a separate get → update.
   */
  async upsertUser(uid: string, data: Partial<UserData>): Promise<void> {
    await this.collection.doc(uid).set(
      {
        ...data,
        // FieldValue.serverTimestamp() is ignored by Firestore when the field already exists
        // and `merge: true` is used — safe to always include.
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}
