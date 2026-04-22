import type { HolidayRepository } from '../repositories/holiday';

export class HolidayService {
  constructor(private holidayRepo: HolidayRepository) {}

  async listHolidays() {
    const snapshot = await this.holidayRepo.getAllHolidays();

    const holidays = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        imageUrl: data.imageUrl,
        defaultGreeting: data.defaultGreeting ?? '',
      };
    });

    return { holidays };
  }
}
