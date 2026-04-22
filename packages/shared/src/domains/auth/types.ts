import type { User, Unsubscribe } from 'firebase/auth';
import type { AuthStatus } from '../../constants';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Email после вызова sendEmailOtp — для дедупликации и отображения таймера */
  pendingEmail: string | null;
  /** Unix timestamp (ms) момента отправки OTP — клиентский таймер обратного отсчёта */
  otpSentAt: number | null;
  initialize: (initData: string) => Unsubscribe;
  setUser: (user: User | null) => void;
  setPendingOtp: (email: string, sentAt: number) => void;
  clearPendingOtp: () => void;
  signOut: () => Promise<void>;
}
