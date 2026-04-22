import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { AUTH_STATUS } from '../../constants';
import { authApi } from './api';
import type { AuthState } from './types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: AUTH_STATUS.IDLE,
  pendingEmail: null,
  otpSentAt: null,

  setUser: (user) =>
    set({ user, status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED }),

  setPendingOtp: (email, sentAt) => set({ pendingEmail: email, otpSentAt: sentAt }),

  clearPendingOtp: () => set({ pendingEmail: null, otpSentAt: null }),

  /**
   * Инициализация авторизации при старте TMA.
   * initData — tg.initData из Telegram WebApp SDK.
   *
   * Алгоритм:
   * 1. Всегда выполняем telegramAuth (чтение Firestore по telegramId)
   * 2. Если hasEmail: true  → signInWithCustomToken уже вызван в api, onAuthStateChanged поставит AUTHENTICATED
   * 3. Если hasEmail: false → ставим EMAIL_REQUIRED, показываем OTP форму
   * 4. Ошибка telegramAuth → UNAUTHENTICATED
   *
   * onAuthStateChanged не перебивает EMAIL_REQUIRED (пользователь без email не должен
   * попасть на главный экран пока не пройдёт OTP).
   */
  initialize: (initData: string) => {
    set({ status: AUTH_STATUS.LOADING });

    if (!initData) {
      // Не в Telegram — не обслуживаем
      set({ status: AUTH_STATUS.UNAUTHENTICATED });
    } else {
      authApi.authenticateTelegram(initData)
        .then(({ hasEmail }) => {
          if (!hasEmail) {
            // TG подпись валидна, но пользователь не зарегистрирован → нужен OTP
            set({ status: AUTH_STATUS.EMAIL_REQUIRED });
          }
          // hasEmail: true → signInWithCustomToken уже вызван в authApi
          // onAuthStateChanged ниже поймает user и поставит AUTHENTICATED
        })
        .catch((err) => {
          console.error('[Auth] telegramAuth failed:', err);
          set({ status: AUTH_STATUS.UNAUTHENTICATED });
        });
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        const currentStatus = get().status;
        if (user) {
          // Пользователь вошёл → AUTHENTICATED в любом случае
          set({ user, status: AUTH_STATUS.AUTHENTICATED });
        } else if (
          currentStatus !== AUTH_STATUS.EMAIL_REQUIRED &&
          currentStatus !== AUTH_STATUS.LOADING
        ) {
          // Не перебиваем EMAIL_REQUIRED — пользователь должен пройти OTP
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
