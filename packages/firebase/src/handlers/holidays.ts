import { FUNCTION_CONFIG } from '@unbogi/contracts';
import { onCall } from 'firebase-functions/v2/https';
import { HolidayRepository } from '../repositories';
import { HolidayService } from '../services';

// Dependencies composed at module level (singleton per cold-start)
const holidayService = new HolidayService(new HolidayRepository());

/** Returns all available holidays with resolved Storage image URLs. */
export const list = onCall({ region: FUNCTION_CONFIG.REGION }, async () => holidayService.listHolidays());
