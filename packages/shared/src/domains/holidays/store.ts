import { create } from 'zustand';
import { holidaysApi } from './api';
import type { HolidaysState } from './types';

export const useHolidaysStore = create<HolidaysState>((set, get) => ({
  holidays: [],
  isLoading: false,
  isLoaded: false,

  loadHolidays: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });

    try {
      const holidays = await holidaysApi.list();
      set({ holidays, isLoaded: true });
    } catch (error) {
      console.error('Failed to load holidays:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ holidays: [], isLoading: false, isLoaded: false }),
}));
