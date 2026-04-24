import { COLLECTIONS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';

export class ContactRepository {
  private get db() {
    return admin.firestore();
  }

  private get collection() {
    return this.db.collection(COLLECTIONS.CONTACTS);
  }

  /** Returns all contact entries where the given user is the owner. */
  async getContacts(ownerId: string) {
    return this.collection.where('ownerId', '==', ownerId).get();
  }

  /** Returns `true` when a contact record exists from `userId1` to `userId2`. */
  async areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
    const snap = await this.collection.where('ownerId', '==', userId1).where('userId', '==', userId2).limit(1).get();

    return !snap.empty;
  }

  /** Batch-fetches user documents by an array of UIDs. */
  async getUsersByIds(userIds: string[]) {
    if (userIds.length === 0) return [];
    const userRefs = userIds.map((id) => this.db.collection(COLLECTIONS.USERS).doc(id));
    return this.db.getAll(...userRefs);
  }
}
