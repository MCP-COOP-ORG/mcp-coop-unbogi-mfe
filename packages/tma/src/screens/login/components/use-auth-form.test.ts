import { act, renderHook } from '@testing-library/react';
import { authApi, useAuthStore } from '@unbogi/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { tg } from '@/lib';
import { useAuthForm } from './use-auth-form';

// Mock translations
vi.mock('@/hooks', () => ({
  useT: () => ({
    auth: {
      invalidEmail: 'invalidEmail',
      invalidCode: 'invalidCode',
      errorGeneric: 'errorGeneric',
      errorInvalidCode: 'errorInvalidCode',
      errorTooManyAttempts: 'errorTooManyAttempts',
      errorExpired: 'errorExpired',
      otpExpired: 'otpExpired',
    },
  }),
}));

// Mock API and Telegram
vi.mock('@unbogi/shared', async () => {
  const actual = await vi.importActual('@unbogi/shared');
  return {
    ...actual,
    authApi: {
      sendEmailOtp: vi.fn(),
      verifyEmailOtp: vi.fn(),
    },
    auth: {
      currentUser: { uid: 'user_123' },
    },
  };
});

vi.mock('@/lib', async () => {
  const actual = await vi.importActual('@/lib');
  return {
    ...actual,
    tg: {
      isInitDataPresent: true,
      initData: 'mock_init_data',
      haptic: vi.fn(),
    },
  };
});

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAuthStore.setState({ pendingEmail: null, otpSentAt: null, user: null });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes in email step if no pending otp', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.step).toBe('email');
    expect(result.current.email).toBe('');
  });

  it('initializes in code step if valid pending otp exists', () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.step).toBe('code');
    expect(result.current.email).toBe('test@example.com');
  });

  it('validates email correctly', () => {
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleEmailChange('invalid');
      result.current.handleEmailBlur();
    });

    expect(result.current.isEmailValid).toBe(false);
    expect(result.current.errorToShow).toBe('invalidEmail');

    act(() => {
      result.current.handleEmailChange('test@example.com');
    });

    expect(result.current.isEmailValid).toBe(true);
    expect(result.current.errorToShow).toBe(null);
  });

  it('handles sendEmail success', async () => {
    vi.mocked(authApi.sendEmailOtp).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
    });

    await act(async () => {
      await result.current.handleSendEmail();
    });

    expect(authApi.sendEmailOtp).toHaveBeenCalledWith('test@example.com', 'mock_init_data');
    expect(tg.haptic).toHaveBeenCalledWith('light');
    expect(result.current.step).toBe('code');
    expect(useAuthStore.getState().pendingEmail).toBe('test@example.com');
  });

  it('skips sendEmail if valid pending OTP exists for the same email', async () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    const { result } = renderHook(() => useAuthForm());

    // Switch to email step to test transition back to code step
    act(() => {
      result.current.handleBack();
    });

    await act(async () => {
      await result.current.handleSendEmail();
    });

    expect(authApi.sendEmailOtp).not.toHaveBeenCalled();
    expect(result.current.step).toBe('code');
  });

  it('throws error if Telegram init data is missing', async () => {
    // @ts-expect-error
    tg.isInitDataPresent = false;
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
    });

    await act(async () => {
      await result.current.handleSendEmail();
    });

    expect(result.current.apiError).toBe('errorGeneric');
    // @ts-expect-error
    tg.isInitDataPresent = true; // restore
  });

  it('handles sendEmail failure', async () => {
    vi.mocked(authApi.sendEmailOtp).mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleEmailChange('test@example.com');
    });

    await act(async () => {
      await result.current.handleSendEmail();
    });

    expect(result.current.step).toBe('email');
    expect(result.current.apiError).toBe('errorGeneric');
    expect(result.current.errorToShow).toBe('errorGeneric');
  });

  it('validates code correctly', () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleCodeChange('123'); // Too short
      result.current.handleCodeBlur();
    });

    expect(result.current.isCodeValid).toBe(false);
    expect(result.current.errorToShow).toBe('invalidCode');

    act(() => {
      result.current.handleCodeChange('123456');
    });

    expect(result.current.isCodeValid).toBe(true);
    expect(result.current.errorToShow).toBe(null);
  });

  it('handles verify code success', async () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    vi.mocked(authApi.verifyEmailOtp).mockResolvedValueOnce({} as never);

    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleCodeChange('123456');
    });

    await act(async () => {
      await result.current.handleSubmitCode();
    });

    expect(authApi.verifyEmailOtp).toHaveBeenCalledWith('test@example.com', '123456');
    expect(tg.haptic).toHaveBeenCalledWith('medium');
    expect(useAuthStore.getState().user).toEqual({ uid: 'user_123' });
  });

  it('handles verify code failure with invalid code', async () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    vi.mocked(authApi.verifyEmailOtp).mockRejectedValueOnce(new Error('Invalid code'));

    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleCodeChange('123456');
    });

    await act(async () => {
      await result.current.handleSubmitCode();
    });

    expect(tg.haptic).toHaveBeenCalledWith('heavy');
    expect(result.current.apiError).toBe('errorInvalidCode');
    expect(result.current.code).toBe('123456'); // Code should not be cleared
  });

  it('handles verify code failure with too many attempts', async () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    vi.mocked(authApi.verifyEmailOtp).mockRejectedValueOnce(new Error('Too many attempts'));

    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleCodeChange('123456');
    });

    await act(async () => {
      await result.current.handleSubmitCode();
    });

    expect(result.current.apiError).toBe('errorTooManyAttempts');
    expect(result.current.code).toBe(''); // Code should be cleared
  });

  it('handles timer expired', () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleTimerExpired();
    });

    expect(result.current.otpExpired).toBe(true);
    expect(result.current.errorToShow).toBe('otpExpired');
    expect(useAuthStore.getState().pendingEmail).toBe(null);
  });

  it('handles back button', () => {
    useAuthStore.setState({ pendingEmail: 'test@example.com', otpSentAt: Date.now() });
    const { result } = renderHook(() => useAuthForm());

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.step).toBe('email');
    expect(result.current.code).toBe('');
    expect(result.current.isCodeDirty).toBe(false);
  });
});
