import { httpsCallable } from 'firebase/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { holidaysApi } from './api';
import { useHolidaysStore } from './store';

describe('Holidays Domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHolidaysStore.setState({ holidays: [], isLoading: false, isLoaded: false });
  });

  describe('api', () => {
    it('list should fetch holidays', async () => {
      const mockHolidays = [{ id: '1', name: 'Test Holiday' }];
      const mockCallable = vi.fn().mockResolvedValue({ data: { holidays: mockHolidays } });
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const result = await holidaysApi.list();
      expect(result).toEqual(mockHolidays);
      expect(mockCallable).toHaveBeenCalledWith({});
    });
  });

  describe('store', () => {
    it('should load holidays successfully', async () => {
      const mockHolidays = [{ id: '1', name: 'Test Holiday' }];
      vi.spyOn(holidaysApi, 'list').mockResolvedValue(mockHolidays as never);

      const store = useHolidaysStore.getState();
      await store.loadHolidays();

      const newState = useHolidaysStore.getState();
      expect(newState.holidays).toEqual(mockHolidays);
      expect(newState.isLoaded).toBe(true);
      expect(newState.isLoading).toBe(false);
    });

    it('should not load if already loading or loaded', async () => {
      useHolidaysStore.setState({ isLoading: true });
      const spy = vi.spyOn(holidaysApi, 'list');
      await useHolidaysStore.getState().loadHolidays();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(holidaysApi, 'list').mockRejectedValue(new Error('Test Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await useHolidaysStore.getState().loadHolidays();

      const newState = useHolidaysStore.getState();
      expect(newState.isLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load holidays:', expect.any(Error));
    });

    it('should reset state', () => {
      useHolidaysStore.setState({
        holidays: [{ id: '1', name: 'Test Holiday' }] as never,
        isLoaded: true,
        isLoading: true,
      });
      useHolidaysStore.getState().reset();

      const newState = useHolidaysStore.getState();
      expect(newState.holidays).toEqual([]);
      expect(newState.isLoaded).toBe(false);
      expect(newState.isLoading).toBe(false);
    });
  });
});
