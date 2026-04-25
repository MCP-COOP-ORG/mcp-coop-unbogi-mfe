import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HolidayService } from './holiday';

vi.mock('../utils/storage', () => ({
  mapTimestamp: vi.fn((ts) => (ts ? new Date(ts.toMillis()).toISOString() : null)),
  resolveStorageUrl: vi.fn().mockResolvedValue('https://mocked-url.com/image.png'),
}));

describe('HolidayService (Unit)', () => {
  let holidayService: HolidayService;
  let mockHolidayRepo: any;

  beforeEach(() => {
    mockHolidayRepo = {
      getAllHolidays: vi.fn(),
    };
    holidayService = new HolidayService(mockHolidayRepo);
  });

  describe('listHolidays', () => {
    it('should return an empty list if no holidays found', async () => {
      mockHolidayRepo.getAllHolidays.mockResolvedValue({ docs: [] });

      const result = await holidayService.listHolidays();

      expect(result).toEqual({ holidays: [] });
    });

    it('should return mapped holidays', async () => {
      const mockTimestamp = { toMillis: () => 1600000000000 };
      mockHolidayRepo.getAllHolidays.mockResolvedValue({
        docs: [
          {
            id: 'holiday1',
            data: () => ({
              name: 'New Year',
              imageUrl: 'gs://bucket/new-year.png',
              defaultGreeting: 'Happy New Year!',
              createdAt: mockTimestamp,
            }),
          },
          {
            id: 'holiday2',
            data: () => ({
              name: 'Halloween',
              imageUrl: 'gs://bucket/halloween.png',
              createdAt: mockTimestamp,
            }),
          },
        ],
      });

      const result = await holidayService.listHolidays();

      expect(mockHolidayRepo.getAllHolidays).toHaveBeenCalled();
      expect(result).toEqual({
        holidays: [
          {
            id: 'holiday1',
            name: 'New Year',
            imageUrl: 'https://mocked-url.com/image.png',
            defaultGreeting: 'Happy New Year!',
            createdAt: new Date(1600000000000).toISOString(),
          },
          {
            id: 'holiday2',
            name: 'Halloween',
            imageUrl: 'https://mocked-url.com/image.png',
            defaultGreeting: '',
            createdAt: new Date(1600000000000).toISOString(),
          },
        ],
      });
    });
  });
});
