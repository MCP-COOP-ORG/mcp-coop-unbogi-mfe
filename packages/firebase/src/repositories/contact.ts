import { COLLECTIONS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';

export class ContactRepository {
  private get db() {
    return admin.firestore();
  }

  async getContacts(ownerId: string) {
    return await this.db.collection(COLLECTIONS.CONTACTS).where('ownerId', '==', ownerId).get();
  }

  async areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
    const snap = await this.db
      .collection(COLLECTIONS.CONTACTS)
      .where('ownerId', '==', userId1)
      .where('userId', '==', userId2)
      .limit(1)
      .get();

    return !snap.empty;
  }

  async getUsersByIds(userIds: string[]) {
    if (userIds.length === 0) return [];
    const userRefs = userIds.map((id) => this.db.collection(COLLECTIONS.USERS).doc(id));
    return await this.db.getAll(...userRefs);
  }
}
