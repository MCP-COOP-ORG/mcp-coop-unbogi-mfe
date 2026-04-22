import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@unbogi/contracts';

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

  /**
   * Ищет пользователя по telegramId.
   * Используется в telegramAuth — только чтение, никаких записей.
   */
  async findByTelegramId(telegramId: number): Promise<UserData | null> {
    const snap = await this.collection
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0].data() as UserData;
  }

  async upsertUser(uid: string, data: Partial<UserData>): Promise<void> {
    const userRef = this.collection.doc(uid);
    await userRef.set(data, { merge: true });

    // Set createdAt only if it's new
    const snap = await userRef.get();
    if (!snap.data()?.createdAt) {
      await userRef.update({
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
}
