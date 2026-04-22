import * as admin from 'firebase-admin';
import { COLLECTIONS } from '@unbogi/contracts';

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
