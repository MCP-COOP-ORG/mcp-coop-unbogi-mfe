import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STATUS } from '../../constants';
import { useAuthStore } from './store';

// Type-safe mock helpers
const mockHttpsCallable = vi.mocked(httpsCallable);
const mockSignInWithCustomToken = vi.mocked(signInWithCustomToken);
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useAuthStore.setState({
      user: null,
      status: AUTH_STATUS.IDLE,
      pendingEmail: null,
      otpSentAt: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with IDLE status and null user', () => {
      const state = useAuthStore.getState();
      expect(state.status).toBe(AUTH_STATUS.IDLE);
      expect(state.user).toBeNull();
      expect(state.pendingEmail).toBeNull();
      expect(state.otpSentAt).toBeNull();
    });
  });

  describe('setUser', () => {
    it('sets AUTHENTICATED when user is provided', () => {
      const mockUser = { uid: 'test-uid' } as never;
      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.AUTHENTICATED);
      expect(useAuthStore.getState().user).toBe(mockUser);
    });

    it('sets UNAUTHENTICATED when user is null', () => {
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    });
  });

  describe('setPendingOtp / clearPendingOtp', () => {
    it('stores email and timestamp', () => {
      useAuthStore.getState().setPendingOtp('test@example.com', 1000);
      expect(useAuthStore.getState().pendingEmail).toBe('test@example.com');
      expect(useAuthStore.getState().otpSentAt).toBe(1000);
    });

    it('clears pending OTP data', () => {
      useAuthStore.getState().setPendingOtp('test@example.com', 1000);
      useAuthStore.getState().clearPendingOtp();
      expect(useAuthStore.getState().pendingEmail).toBeNull();
      expect(useAuthStore.getState().otpSentAt).toBeNull();
    });
  });

  describe('initialize', () => {
    it('sets UNAUTHENTICATED immediately if initData is empty', () => {
      mockOnAuthStateChanged.mockReturnValue(vi.fn());
      useAuthStore.getState().initialize('');
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    });

    it('sets LOADING then EMAIL_REQUIRED when hasEmail is false', async () => {
      const callFn = vi.fn().mockResolvedValue({ data: { hasEmail: false } });
      mockHttpsCallable.mockReturnValue(callFn as never);
      mockOnAuthStateChanged.mockReturnValue(vi.fn());

      useAuthStore.getState().initialize('valid-init-data');

      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.LOADING);

      await vi.advanceTimersByTimeAsync(0);

      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.EMAIL_REQUIRED);
    });

    it('sets AUTHENTICATED when hasEmail is true', async () => {
      const callFn = vi.fn().mockResolvedValue({ data: { hasEmail: true } });
      mockHttpsCallable.mockReturnValue(callFn as never);
      mockOnAuthStateChanged.mockReturnValue(vi.fn());

      useAuthStore.getState().initialize('valid-init-data');
      await vi.advanceTimersByTimeAsync(0);

      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.AUTHENTICATED);
    });

    it('retries on failure with exponential backoff up to 3 times', async () => {
      const callFn = vi.fn().mockRejectedValue(new Error('network error'));
      mockHttpsCallable.mockReturnValue(callFn as never);
      mockOnAuthStateChanged.mockReturnValue(vi.fn());

      useAuthStore.getState().initialize('valid-init-data');

      // Attempt 1 fails
      await vi.advanceTimersByTimeAsync(0);
      expect(callFn).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.LOADING);

      // Wait 1s for retry
      await vi.advanceTimersByTimeAsync(1000);
      expect(callFn).toHaveBeenCalledTimes(2);

      // Wait 2s for retry
      await vi.advanceTimersByTimeAsync(2000);
      expect(callFn).toHaveBeenCalledTimes(3);

      // Wait 4s — should be AUTH_ERROR now
      await vi.advanceTimersByTimeAsync(4000);
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.AUTH_ERROR);
    });

    it('returns an unsubscribe function from onAuthStateChanged', () => {
      const unsubscribe = vi.fn();
      mockOnAuthStateChanged.mockReturnValue(unsubscribe);

      const unsub = useAuthStore.getState().initialize('');
      expect(unsub).toBe(unsubscribe);
    });

    it('handles startParam invite flow falling back to normal auth', async () => {
      // redeemEmailInvite fails → fallback to performNormalAuth
      const redeemFn = vi.fn().mockRejectedValue(new Error('expired'));
      const authFn = vi.fn().mockResolvedValue({ data: { hasEmail: false } });
      mockHttpsCallable
        .mockReturnValueOnce(redeemFn as never) // redeemEmailInvite
        .mockReturnValueOnce(authFn as never); // telegramAuth
      mockOnAuthStateChanged.mockReturnValue(vi.fn());

      useAuthStore.getState().initialize('valid-init-data', 'invite-token');

      // redeemEmailInvite fails
      await vi.advanceTimersByTimeAsync(0);
      // fallback to performNormalAuth → next tick resolves
      await vi.advanceTimersByTimeAsync(0);

      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.EMAIL_REQUIRED);
    });

    it('handles successful startParam invite flow', async () => {
      const redeemFn = vi.fn().mockResolvedValue({ data: { token: 'custom-token' } });
      mockHttpsCallable.mockReturnValue(redeemFn as never);
      mockSignInWithCustomToken.mockResolvedValue({ user: { uid: 'u1' } } as never);
      mockOnAuthStateChanged.mockReturnValue(vi.fn());

      useAuthStore.getState().initialize('valid-init-data', 'invite-token');
      await vi.advanceTimersByTimeAsync(0);

      expect(mockSignInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'custom-token');
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.AUTHENTICATED);
    });

    describe('onAuthStateChanged callback', () => {
      it('ignores callback if telegram auth is not resolved', () => {
        let authCallback: (user: unknown) => void = () => {};
        mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
          authCallback = cb as (user: unknown) => void;
          return vi.fn();
        });

        // Setup so telegram auth is pending
        const callFn = vi.fn().mockReturnValue(new Promise(() => {}));
        mockHttpsCallable.mockReturnValue(callFn as never);
        useAuthStore.getState().initialize('valid-init-data');

        // Trigger callback with a user
        authCallback({ uid: 'cached-user' });

        // Status should still be LOADING
        expect(useAuthStore.getState().status).toBe(AUTH_STATUS.LOADING);
      });

      it('handles user login after telegram auth is resolved', async () => {
        let authCallback: (user: unknown) => void = () => {};
        mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
          authCallback = cb as (user: unknown) => void;
          return vi.fn();
        });

        const callFn = vi.fn().mockResolvedValue({ data: { hasEmail: true } });
        mockHttpsCallable.mockReturnValue(callFn as never);
        useAuthStore.getState().initialize('valid-init-data');
        await vi.advanceTimersByTimeAsync(0); // Resolve telegram auth

        authCallback({ uid: 'new-user' });
        expect(useAuthStore.getState().user).toEqual({ uid: 'new-user' });
        expect(useAuthStore.getState().status).toBe(AUTH_STATUS.AUTHENTICATED);
      });

      it('handles user logout (null user) after telegram auth is resolved', async () => {
        let authCallback: (user: unknown) => void = () => {};
        mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
          authCallback = cb as (user: unknown) => void;
          return vi.fn();
        });

        const callFn = vi.fn().mockResolvedValue({ data: { hasEmail: true } });
        mockHttpsCallable.mockReturnValue(callFn as never);
        useAuthStore.getState().initialize('valid-init-data');
        await vi.advanceTimersByTimeAsync(0); // Resolve telegram auth

        // Ensure status is NOT EMAIL_REQUIRED or LOADING
        useAuthStore.setState({ status: AUTH_STATUS.AUTHENTICATED });

        authCallback(null);
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
      });

      it('handles auth error callback', async () => {
        let errorCallback: (err: Error) => void = () => {};
        mockOnAuthStateChanged.mockImplementation((_auth, _cb, errCb) => {
          errorCallback = errCb as (err: Error) => void;
          return vi.fn();
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        useAuthStore.getState().initialize('valid-init-data');

        errorCallback(new Error('Auth failed'));
        expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('signOut', () => {
    it('resets user and status', async () => {
      useAuthStore.setState({
        user: { uid: 'u1' } as never,
        status: AUTH_STATUS.AUTHENTICATED,
        pendingEmail: 'a@b.com',
        otpSentAt: 123,
      });

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
      expect(useAuthStore.getState().pendingEmail).toBeNull();
      expect(useAuthStore.getState().otpSentAt).toBeNull();
    });
  });
});
