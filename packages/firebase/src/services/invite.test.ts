import { CONFIG, ERROR_CODES, ERROR_MESSAGES, PROVIDERS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InviteService } from './invite';

vi.mock('firebase-admin', () => ({
  auth: vi.fn().mockReturnValue({
    createCustomToken: vi.fn().mockResolvedValue('mocked-custom-token'),
  }),
}));

vi.mock('firebase-functions/logger', () => ({
  info: vi.fn(),
  error: vi.fn(),
}));

const mockResendSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

vi.mock('../utils/firebase-auth', () => ({
  getOrCreateFirebaseUser: vi.fn().mockResolvedValue({ uid: 'mock-uid' }),
}));

describe('InviteService (Unit)', () => {
  let inviteService: InviteService;
  let mockInviteRepo: any;
  let mockUserRepo: any;
  let mockAuthService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteRepo = {
      createInvite: vi.fn().mockResolvedValue('mock-token'),
      runAcceptInviteTransaction: vi.fn().mockResolvedValue(undefined),
      createEmailInvite: vi.fn().mockResolvedValue('email-token'),
      getInvite: vi.fn(),
      runRedeemEmailInviteTransaction: vi.fn().mockResolvedValue(undefined),
    };
    mockUserRepo = {
      findById: vi.fn().mockResolvedValue({ nickname: 'TestUser' }),
      upsertUser: vi.fn().mockResolvedValue(undefined),
    };
    mockAuthService = {
      validateAndExtractUser: vi.fn().mockReturnValue({
        id: 12345,
        username: 'tguser',
      }),
    };

    inviteService = new InviteService(mockInviteRepo, mockUserRepo, mockAuthService);
  });

  describe('createInvite', () => {
    it('should create an invite and return a token', async () => {
      const result = await inviteService.createInvite('sender-1', { type: 'one-time' });
      expect(mockInviteRepo.createInvite).toHaveBeenCalledWith('sender-1');
      expect(result).toEqual({ token: 'mock-token' });
    });
  });

  describe('acceptInvite', () => {
    it('should run transaction and return success', async () => {
      const result = await inviteService.acceptInvite('acceptor-1', { token: 'mock-token' });
      expect(mockInviteRepo.runAcceptInviteTransaction).toHaveBeenCalledWith('mock-token', 'acceptor-1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendEmailInvite', () => {
    it('should send email and return success', async () => {
      mockResendSend.mockResolvedValue({ data: { id: 'msg-id' }, error: null });
      const result = await inviteService.sendEmailInvite(
        'sender-1',
        { targetEmail: 'test@example.com' },
        'botUsername',
        'api-key',
      );
      expect(mockInviteRepo.createEmailInvite).toHaveBeenCalledWith(
        'sender-1',
        'test@example.com',
        CONFIG.INVITE_LIFETIME_MS,
      );
      expect(mockResendSend).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should throw INTERNAL error if email sending fails', async () => {
      mockResendSend.mockResolvedValue({ data: null, error: new Error('Resend err') });
      await expect(
        inviteService.sendEmailInvite('sender-1', { targetEmail: 'test@example.com' }, 'botUsername', 'api-key'),
      ).rejects.toThrow(new HttpsError(ERROR_CODES.INTERNAL as any, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL));
    });
  });

  describe('redeemEmailInvite', () => {
    const payload = { inviteToken: 'mock-token', initData: 'mock-data' };

    it('should throw NOT_FOUND if invite does not exist', async () => {
      mockInviteRepo.getInvite.mockResolvedValue(null);
      await expect(inviteService.redeemEmailInvite(payload, 'bot-token')).rejects.toThrow(
        new HttpsError(ERROR_CODES.NOT_FOUND as any, 'Invite not found'),
      );
    });

    it('should redeem invite and return custom token', async () => {
      mockInviteRepo.getInvite.mockResolvedValue({ targetEmail: 'test@example.com' });

      const result = await inviteService.redeemEmailInvite(payload, 'bot-token');

      expect(mockAuthService.validateAndExtractUser).toHaveBeenCalledWith('mock-data', 'bot-token');
      expect(mockUserRepo.upsertUser).toHaveBeenCalledWith(
        'mock-uid',
        expect.objectContaining({
          uid: 'mock-uid',
          email: 'test@example.com',
          telegramId: 12345,
          nickname: 'tguser',
          provider: PROVIDERS.EMAIL,
        }),
      );
      expect(mockInviteRepo.runRedeemEmailInviteTransaction).toHaveBeenCalledWith('mock-token', 'mock-uid');
      expect(admin.auth().createCustomToken).toHaveBeenCalledWith('mock-uid');
      expect(result).toEqual({ token: 'mocked-custom-token' });
    });
  });
});
