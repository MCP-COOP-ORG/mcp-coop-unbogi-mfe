import { COLLECTIONS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';

export class HolidayRepository {
  private get db() {
    return admin.firestore();
  }

  async getAllHolidays() {
    return await this.db.collection(COLLECTIONS.HOLIDAYS).get();
  }

  async getHoliday(holidayId: string) {
    return await this.db.collection(COLLECTIONS.HOLIDAYS).doc(holidayId).get();
  }
}
