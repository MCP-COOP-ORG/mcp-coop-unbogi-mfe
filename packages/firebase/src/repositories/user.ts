import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@unbogi/contracts';

interface UserData {
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
