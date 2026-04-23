import { COLLECTIONS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';

export class HolidayRepository {
  private get db() {
    return admin.firestore();
  }

  private get collection() {
    return this.db.collection(COLLECTIONS.HOLIDAYS);
  }

  /** Returns all holiday documents. */
  async getAllHolidays() {
    return this.collection.get();
  }

  /** Returns a single holiday document by its ID. */
  async getHoliday(holidayId: string) {
    return this.collection.doc(holidayId).get();
  }
}
