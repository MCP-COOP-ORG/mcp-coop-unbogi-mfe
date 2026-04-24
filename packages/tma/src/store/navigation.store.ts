import { create } from 'zustand';

export const SCREENS = {
  /** Unified gift screen — active mode (surprises/collection) is in giftMode.store. */
  MAIN: 'main',
  SEND: 'send',
} as const;

export type ScreenId = (typeof SCREENS)[keyof typeof SCREENS];

interface NavigationState {
  activeScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeScreen: SCREENS.MAIN,
  setScreen: (screen) => set({ activeScreen: screen }),
}));
