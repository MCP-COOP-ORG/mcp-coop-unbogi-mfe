import { INVITE_PREFIX } from '@unbogi/contracts';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { create } from 'zustand';
import { AUTH_STATUS } from '../../constants';
import { auth } from '../../firebase';
import { invitesApi } from '../invites/api';
import { authApi } from './api';
import type { AuthState } from './types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: AUTH_STATUS.IDLE,
  pendingEmail: null,
  otpSentAt: null,

  setUser: (user) => set({ user, status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED }),

  setPendingOtp: (email, sentAt) => set({ pendingEmail: email, otpSentAt: sentAt }),

  clearPendingOtp: () => set({ pendingEmail: null, otpSentAt: null }),

  /**
   * Initializes authentication on TMA startup.
   * initData — tg.initData from the Telegram WebApp SDK.
   *
   * Flow:
   * 1. Always execute telegramAuth (verifies signature & checks Firestore by telegramId)
   * 2. If hasEmail: true  → signInWithCustomToken is already called in api, state becomes AUTHENTICATED
   * 3. If hasEmail: false → set EMAIL_REQUIRED, displaying the OTP form
   * 4. If telegramAuth fails → UNAUTHENTICATED
   */
  initialize: (initData: string, startParam?: string) => {
    set({ status: AUTH_STATUS.LOADING });

    let isTelegramAuthResolved = false;

    const performNormalAuth = () => {
      authApi
        .authenticateTelegram(initData)
        .then(({ hasEmail }) => {
          isTelegramAuthResolved = true;
          if (!hasEmail) {
            set({ status: AUTH_STATUS.EMAIL_REQUIRED });
          } else {
            // If hasEmail === true, signInWithCustomToken has already been called
            set({ user: auth.currentUser, status: AUTH_STATUS.AUTHENTICATED });
          }
        })
        .catch((err) => {
          console.error('[Auth] telegramAuth failed:', err);
          isTelegramAuthResolved = true;
          set({ status: AUTH_STATUS.UNAUTHENTICATED });
        });
    };

    if (!initData) {
      isTelegramAuthResolved = true;
      set({ status: AUTH_STATUS.UNAUTHENTICATED });
    } else if (startParam) {
      invitesApi
        .redeemEmailInvite(startParam, initData)
        .then(({ token }) => signInWithCustomToken(auth, token))
        .then(() => {
          isTelegramAuthResolved = true;
          set({ user: auth.currentUser, status: AUTH_STATUS.AUTHENTICATED });
        })
        .catch((err) => {
          console.error('[Auth] redeemEmailInvite failed:', err);
          // Fallback to normal auth if invite redeem fails (e.g. expired or already used)
          performNormalAuth();
        });
    } else {
      performNormalAuth();
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // If telegramAuth hasn't finished yet, we IGNORE the cached user
        // from Firebase Auth to prevent showing ActiveScreen prematurely and causing flickering.
        if (!isTelegramAuthResolved) {
          return;
        }

        const currentStatus = get().status;
        if (user) {
          set({ user, status: AUTH_STATUS.AUTHENTICATED });
        } else if (currentStatus !== AUTH_STATUS.EMAIL_REQUIRED && currentStatus !== AUTH_STATUS.LOADING) {
          set({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
        }
      },
      (error) => {
        console.error('[Auth] onAuthStateChanged error:', error);
        set({ status: AUTH_STATUS.UNAUTHENTICATED });
      },
    );

    return unsubscribe;
  },

  signOut: async () => {
    await auth.signOut();
    set({
      user: null,
      status: AUTH_STATUS.UNAUTHENTICATED,
      pendingEmail: null,
      otpSentAt: null,
    });
  },
}));
