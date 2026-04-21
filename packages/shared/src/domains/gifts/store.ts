import { create } from 'zustand';
import { giftsApi } from './api';
import type { GiftsState } from './types';

export const useGiftsStore = create<GiftsState>((set, get) => ({
  isLoaded: false,
  isLoading: false,
  receivedGifts: [],
  openedGifts: [],

  loadGifts: async () => {
    if (get().isLoading) return;

    const hasData = get().isLoaded;
    if (!hasData) set({ isLoading: true });

    try {
      const [receivedGifts, openedGifts] = await Promise.all([
        giftsApi.getReceived(),
        giftsApi.getOpened(),
      ]);

      receivedGifts.sort(
        (a, b) => new Date(a.unpackDate).getTime() - new Date(b.unpackDate).getTime(),
      );

      set({ receivedGifts, openedGifts, isLoaded: true });
    } catch (error) {
      console.error('Failed to load gifts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendGift: async (payload) => {
    await giftsApi.send(payload);
  },

  scratchGift: async (giftId) => {
    try {
      await giftsApi.scratch(giftId);
    } catch (error) {
      console.error('Failed to scratch gift:', error);
    }
  },

  reset: () => {
    set({
      isLoaded: false,
      isLoading: false,
      receivedGifts: [],
      openedGifts: [],
    });
  },
}));
