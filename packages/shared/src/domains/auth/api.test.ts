import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './api';

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authenticateTelegram should call signInWithCustomToken if token exists', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { token: 'test-token', hasEmail: true } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

    const result = await authApi.authenticateTelegram('initData');
    expect(mockCallable).toHaveBeenCalledWith({ initData: 'initData' });
    expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'test-token');
    expect(result).toEqual({ hasEmail: true });
  });

  it('authenticateTelegram should not call signInWithCustomToken if token is absent', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { hasEmail: false } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

    const result = await authApi.authenticateTelegram('initData');
    expect(signInWithCustomToken).not.toHaveBeenCalled();
    expect(result).toEqual({ hasEmail: false });
  });

  it('sendEmailOtp should call functions with correct params', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { success: true } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

    await authApi.sendEmailOtp('test@test.com', 'initData');
    expect(mockCallable).toHaveBeenCalledWith({ email: 'test@test.com', initData: 'initData' });
  });

  it('verifyEmailOtp should call functions and sign in', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { token: 'verify-token' } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

    await authApi.verifyEmailOtp('test@test.com', '1234');
    expect(mockCallable).toHaveBeenCalledWith({ email: 'test@test.com', code: '1234' });
    expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'verify-token');
  });
});
