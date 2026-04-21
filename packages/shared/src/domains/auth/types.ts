import type { User, Unsubscribe } from 'firebase/auth';
import type { AuthStatus } from '../../constants';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  initialize: () => Unsubscribe;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}
