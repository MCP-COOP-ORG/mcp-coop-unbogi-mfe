import { create } from 'zustand';
import { surprisesStrategy } from '@/screens/main/components/strategies';
import type { GiftScreenStrategy } from '@/screens/main/components/strategies';

interface GiftModeState {
  /** Active display strategy (surprises | collection). Persists across Send navigation. */
  strategy: GiftScreenStrategy;
  setStrategy: (strategy: GiftScreenStrategy) => void;
}

/**
 * Stores which gift-screen mode (surprises / collection) is active.
 *
 * Intentionally decoupled from navigation so that switching to SendForm
 * and back preserves the last selected tab without remounting GiftCarousel.
 */
export const useGiftModeStore = create<GiftModeState>((set) => ({
  strategy: surprisesStrategy,
  setStrategy: (strategy) => set({ strategy }),
}));
