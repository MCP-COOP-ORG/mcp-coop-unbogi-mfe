import * as crypto from 'node:crypto';
import { CONFIG, ERROR_MESSAGES, TELEGRAM_CONSTANTS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { Resend } from 'resend';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth';

// Mock dependencies
vi.mock('firebase-admin', () => {
  return {
    auth: vi.fn().mockReturnValue({
      createCustomToken: vi.fn().mockResolvedValue('mocked-custom-token'),
    }),
    firestore: {
      Timestamp: {
        fromDate: vi.fn((date) => ({ toDate: () => date })),
      },
    },
  };
});

vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
      },
    })),
  };
});

vi.mock('../utils/firebase-auth', () => ({
  getOrCreateFirebaseUser: vi.fn().mockResolvedValue({ uid: 'test-uid' }),
}));

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockOtpRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserRepo = {
      findByTelegramId: vi.fn(),
      upsertUser: vi.fn(),
    };

    mockOtpRepo = {
      getOtp: vi.fn(),
      deleteOtp: vi.fn(),
      setOtp: vi.fn(),
      incrementAttempts: vi.fn(),
    };

    authService = new AuthService(mockUserRepo, mockOtpRepo);

    // Stub validateAndExtractUser to bypass HMAC validation in most tests
    vi.spyOn(authService, 'validateAndExtractUser').mockReturnValue({
      id: 12345,
      username: 'testuser',
      first_name: 'Test',
    });
  });

  describe('validateAndExtractUser', () => {
    beforeEach(() => {
      // Restore the spy to test the real implementation
      (authService.validateAndExtractUser as any).mockRestore();
    });

    it('should throw INVALID_PAYLOAD if no hash', () => {
      expect(() => authService.validateAndExtractUser('query_id=123', 'bot-token')).toThrowError(
        new HttpsError('invalid-argument', ERROR_MESSAGES.INVALID_PAYLOAD),
      );
    });

    it('should throw INVALID_TG_SIGNATURE if hash is invalid', () => {
      const initData = new URLSearchParams({ query_id: '123', hash: 'badhash' });
      expect(() => authService.validateAndExtractUser(initData.toString(), 'bot-token')).toThrowError(
        new HttpsError('unauthenticated', ERROR_MESSAGES.INVALID_TG_SIGNATURE),
      );
    });

    it('should throw TG_USER_NOT_FOUND if user param is missing but hash is valid', () => {
      const botToken = 'fake-token';
      const initData = new URLSearchParams({ query_id: '123' });
      const dataCheckString = 'query_id=123';
      const secretKey = crypto.createHmac(TELEGRAM_CONSTANTS.ALGO, CONFIG.TG_HMAC_CONSTANT).update(botToken).digest();
      const hash = crypto
        .createHmac(TELEGRAM_CONSTANTS.ALGO, secretKey)
        .update(dataCheckString)
        .digest(TELEGRAM_CONSTANTS.ENCODING);
      initData.append('hash', hash);

      expect(() => authService.validateAndExtractUser(initData.toString(), botToken)).toThrowError(
        new HttpsError('invalid-argument', ERROR_MESSAGES.TG_USER_NOT_FOUND),
      );
    });

    it('should throw INVALID_PAYLOAD if user param is invalid JSON', () => {
      const botToken = 'fake-token';
      const initData = new URLSearchParams({ query_id: '123', user: 'not-json' });
      const dataCheckString = 'query_id=123\nuser=not-json';
      const secretKey = crypto.createHmac(TELEGRAM_CONSTANTS.ALGO, CONFIG.TG_HMAC_CONSTANT).update(botToken).digest();
      const hash = crypto
        .createHmac(TELEGRAM_CONSTANTS.ALGO, secretKey)
        .update(dataCheckString)
        .digest(TELEGRAM_CONSTANTS.ENCODING);
      initData.append('hash', hash);

      expect(() => authService.validateAndExtractUser(initData.toString(), botToken)).toThrowError(
        new HttpsError('invalid-argument', ERROR_MESSAGES.INVALID_PAYLOAD),
      );
    });

    it('should return parsed user if payload and hash are valid', () => {
      const botToken = 'fake-token';
      const userObj = { id: 111, first_name: 'Test' };
      const userStr = JSON.stringify(userObj);
      const initData = new URLSearchParams({ query_id: '123', user: userStr });
      const dataCheckString = `query_id=123\nuser=${userStr}`;
      const secretKey = crypto.createHmac(TELEGRAM_CONSTANTS.ALGO, CONFIG.TG_HMAC_CONSTANT).update(botToken).digest();
      const hash = crypto
        .createHmac(TELEGRAM_CONSTANTS.ALGO, secretKey)
        .update(dataCheckString)
        .digest(TELEGRAM_CONSTANTS.ENCODING);
      initData.append('hash', hash);

      const result = authService.validateAndExtractUser(initData.toString(), botToken);
      expect(result).toEqual(userObj);
    });
  });

  describe('authenticateWithTelegram', () => {
    it('should return a custom token if user exists', async () => {
      mockUserRepo.findByTelegramId.mockResolvedValue({ uid: 'existing-uid' });
      const result = await authService.authenticateWithTelegram({ initData: 'mock' }, 'bot-token');
      expect(result).toEqual({ token: 'mocked-custom-token', hasEmail: true });
      expect(admin.auth().createCustomToken).toHaveBeenCalledWith('existing-uid');
    });

    it('should return hasEmail: false if user does not exist', async () => {
      mockUserRepo.findByTelegramId.mockResolvedValue(null);
      const result = await authService.authenticateWithTelegram({ initData: 'mock' }, 'bot-token');
      expect(result).toEqual({ hasEmail: false });
    });
  });

  describe('sendEmailOtp', () => {
    it('should skip sending if a valid OTP already exists', async () => {
      mockOtpRepo.getOtp.mockResolvedValue({
        expiresAt: { toDate: () => new Date(Date.now() + 10000) },
      });
      await authService.sendEmailOtp({ email: 'test@test.com', initData: 'mock' }, 'token', 'resend-key');
      expect(mockOtpRepo.setOtp).not.toHaveBeenCalled();
    });

    it('should send email and save OTP', async () => {
      mockOtpRepo.getOtp.mockResolvedValue(null);
      await authService.sendEmailOtp({ email: 'test@test.com', initData: 'mock' }, 'token', 'resend-key');
      expect(mockOtpRepo.setOtp).toHaveBeenCalled();
    });

    it('should use default nickname if username and first_name are missing', async () => {
      mockOtpRepo.getOtp.mockResolvedValue(null);
      vi.spyOn(authService, 'validateAndExtractUser').mockReturnValue({
        id: 12345,
      });
      await authService.sendEmailOtp({ email: 'test@test.com', initData: 'mock' }, 'token', 'resend-key');
      expect(mockOtpRepo.setOtp).toHaveBeenCalledWith(
        'test@test.com',
        expect.objectContaining({
          nickname: TELEGRAM_CONSTANTS.DEFAULT_NICKNAME,
        }),
      );
    });

    it('should throw FAILED_TO_SEND_EMAIL if Resend fails', async () => {
      mockOtpRepo.getOtp.mockResolvedValue(null);
      vi.mocked(Resend).mockImplementationOnce(
        () =>
          ({
            emails: { send: vi.fn().mockResolvedValue({ error: new Error('Resend failed') }) },
          }) as any,
      );

      await expect(
        authService.sendEmailOtp({ email: 'test@test.com', initData: 'mock' }, 'token', 'resend-key'),
      ).rejects.toThrow(ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
      expect(mockOtpRepo.setOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmailOtp', () => {
    it('should throw NOT_FOUND if OTP record is missing', async () => {
      mockOtpRepo.getOtp.mockResolvedValue(null);
      await expect(authService.verifyEmailOtp({ email: 'test@test.com', code: '123' })).rejects.toThrow(
        ERROR_MESSAGES.NO_PENDING_OTP,
      );
    });

    it('should throw UNAUTHENTICATED and delete OTP if attempts exceeded', async () => {
      mockOtpRepo.getOtp.mockResolvedValue({ attempts: CONFIG.MAX_OTP_ATTEMPTS });
      await expect(authService.verifyEmailOtp({ email: 'test@test.com', code: '123' })).rejects.toThrow(
        ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED,
      );
      expect(mockOtpRepo.deleteOtp).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw UNAUTHENTICATED and increment attempts if code is invalid', async () => {
      mockOtpRepo.getOtp.mockResolvedValue({
        attempts: 0,
        code: '999',
        expiresAt: { toDate: () => new Date(Date.now() + 10000) },
      });
      await expect(authService.verifyEmailOtp({ email: 'test@test.com', code: '123' })).rejects.toThrow(
        ERROR_MESSAGES.INVALID_OTP,
      );
      expect(mockOtpRepo.incrementAttempts).toHaveBeenCalledWith('test@test.com');
    });

    it('should throw UNAUTHENTICATED and delete OTP if expired', async () => {
      mockOtpRepo.getOtp.mockResolvedValue({
        attempts: 0,
        code: '123',
        expiresAt: { toDate: () => new Date(Date.now() - 10000) },
      });
      await expect(authService.verifyEmailOtp({ email: 'test@test.com', code: '123' })).rejects.toThrow(
        ERROR_MESSAGES.EXPIRED_OTP,
      );
      expect(mockOtpRepo.deleteOtp).toHaveBeenCalledWith('test@test.com');
    });

    it('should register user and return token on success', async () => {
      mockOtpRepo.getOtp.mockResolvedValue({
        attempts: 0,
        code: '123',
        expiresAt: { toDate: () => new Date(Date.now() + 10000) },
        telegramId: 12345,
        nickname: 'test',
      });
      const result = await authService.verifyEmailOtp({ email: 'test@test.com', code: '123' });
      expect(mockOtpRepo.deleteOtp).toHaveBeenCalledWith('test@test.com');
      expect(mockUserRepo.upsertUser).toHaveBeenCalled();
      expect(result).toEqual({ token: 'mocked-custom-token' });
    });

    it('should catch unexpected errors and throw AUTH_SYSTEM_ERROR', async () => {
      mockOtpRepo.getOtp.mockResolvedValue({
        attempts: 0,
        code: '123',
        expiresAt: { toDate: () => new Date(Date.now() + 10000) },
        telegramId: 12345,
        nickname: 'test',
      });
      mockUserRepo.upsertUser.mockRejectedValue(new Error('DB failure'));
      await expect(authService.verifyEmailOtp({ email: 'test@test.com', code: '123' })).rejects.toThrowError(
        new HttpsError('internal', ERROR_MESSAGES.AUTH_SYSTEM_ERROR),
      );
    });
  });
});
