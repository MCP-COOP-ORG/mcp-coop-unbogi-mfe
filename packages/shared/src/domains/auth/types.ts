import type { Unsubscribe, User } from 'firebase/auth';
import type { AuthStatus } from '../../constants';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Email after calling sendEmailOtp — used for deduplication and timer display */
  pendingEmail: string | null;
  /** Unix timestamp (ms) of OTP dispatch — used for the client countdown timer */
  otpSentAt: number | null;
  initialize: (initData: string) => Unsubscribe;
  setUser: (user: User | null) => void;
  setPendingOtp: (email: string, sentAt: number) => void;
  clearPendingOtp: () => void;
  signOut: () => Promise<void>;
}
