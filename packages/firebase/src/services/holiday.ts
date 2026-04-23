import type { HolidayRepository } from '../repositories/holiday';
import { mapTimestamp, resolveStorageUrl } from '../utils/storage';

export class HolidayService {
  constructor(private readonly holidayRepo: HolidayRepository) {}

  /** Returns all holidays with resolved Storage download URLs. */
  async listHolidays() {
    const snapshot = await this.holidayRepo.getAllHolidays();

    const holidays = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          imageUrl: await resolveStorageUrl(data.imageUrl),
          defaultGreeting: data.defaultGreeting ?? '',
          createdAt: mapTimestamp(data.createdAt),
        };
      }),
    );

    return { holidays };
  }
}
