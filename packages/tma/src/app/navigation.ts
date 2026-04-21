import { create } from 'zustand';

export const SCREENS = {
  SURPRISES: 'surprises',
  COLLECTION: 'collection',
  SEND: 'send',
} as const;

export type ScreenId = (typeof SCREENS)[keyof typeof SCREENS];

interface NavigationState {
  activeScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeScreen: SCREENS.SURPRISES,
  setScreen: (screen) => set({ activeScreen: screen }),
}));
