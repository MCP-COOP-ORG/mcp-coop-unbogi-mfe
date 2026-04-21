import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { AUTH_STATUS } from '../../constants';
import type { AuthState } from './types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: AUTH_STATUS.IDLE,

  setUser: (user) =>
    set({ user, status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED }),

  initialize: () => {
    set({ status: AUTH_STATUS.LOADING });

    const timeout = setTimeout(() => {
      console.warn('[Auth] onAuthStateChanged timeout — forcing UNAUTHENTICATED');
      set({ status: AUTH_STATUS.UNAUTHENTICATED });
    }, 10_000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timeout);
        set({ user, status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED });
      },
      (error) => {
        clearTimeout(timeout);
        console.error('[Auth] onAuthStateChanged error:', error);
        set({ status: AUTH_STATUS.UNAUTHENTICATED });
      },
    );

    return unsubscribe;
  },

  signOut: async () => {
    await auth.signOut();
    set({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
  },
}));
