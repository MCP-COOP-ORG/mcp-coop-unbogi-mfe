import { httpsCallable } from 'firebase/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invitesApi } from './api';

describe('invitesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sendEmailInvite should call functions with correct params', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { success: true } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

    await invitesApi.sendEmailInvite('test@test.com');
    expect(mockCallable).toHaveBeenCalledWith({ targetEmail: 'test@test.com' });
  });

  it('redeemEmailInvite should call functions and return token', async () => {
    const mockCallable = vi.fn().mockResolvedValue({ data: { token: 'verify-token' } });
    vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

    const result = await invitesApi.redeemEmailInvite('token123', 'initData');
    expect(mockCallable).toHaveBeenCalledWith({ inviteToken: 'token123', initData: 'initData' });
    expect(result).toEqual({ token: 'verify-token' });
  });
});
