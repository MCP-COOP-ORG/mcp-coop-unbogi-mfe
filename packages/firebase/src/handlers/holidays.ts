import { onCall } from 'firebase-functions/v2/https';
import { FUNCTION_CONFIG } from '@unbogi/contracts';
import { HolidayService } from '../services/holiday';
import { HolidayRepository } from '../repositories/holiday';

const holidayRepo = new HolidayRepository();
const holidayService = new HolidayService(holidayRepo);

export const list = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async () => {
    return await holidayService.listHolidays();
  }
);
