import type { HolidayRepository } from '../repositories/holiday';
import { resolveStorageUrl } from '../utils/storage';

export class HolidayService {
  constructor(private holidayRepo: HolidayRepository) {}

  async listHolidays() {
    const snapshot = await this.holidayRepo.getAllHolidays();

    const holidays = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const resolvedImageUrl = await resolveStorageUrl(data.imageUrl);

        return {
          id: doc.id,
          name: data.name,
          imageUrl: resolvedImageUrl,
          defaultGreeting: data.defaultGreeting ?? '',
        };
      }),
    );

    return { holidays };
  }
}
