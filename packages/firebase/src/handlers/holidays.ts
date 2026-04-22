import { FUNCTION_CONFIG } from '@unbogi/contracts';
import { onCall } from 'firebase-functions/v2/https';
import { HolidayRepository } from '../repositories/holiday';
import { HolidayService } from '../services/holiday';

const holidayRepo = new HolidayRepository();
const holidayService = new HolidayService(holidayRepo);

export const list = onCall({ region: FUNCTION_CONFIG.REGION }, async () => {
  return await holidayService.listHolidays();
});
