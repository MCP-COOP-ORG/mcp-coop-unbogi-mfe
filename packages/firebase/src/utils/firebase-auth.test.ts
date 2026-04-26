import { ERROR_MESSAGES, FIREBASE_ERRORS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { getOrCreateFirebaseUser } from './firebase-auth';

vi.mock('firebase-admin', () => ({
  auth: vi.fn().mockReturnValue({
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
  }),
}));

vi.mock('firebase-functions/logger', () => ({
  error: vi.fn(),
}));

describe('FirebaseAuth Utils (Unit)', () => {
  let mockGetUserByEmail: Mock;
  let mockCreateUser: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    const authMock = admin.auth() as unknown as Record<string, Mock>;
    mockGetUserByEmail = authMock.getUserByEmail;
    mockCreateUser = authMock.createUser;
  });

  describe('getOrCreateFirebaseUser', () => {
    it('should return user if exists', async () => {
      const mockUser = { uid: 'user-1' };
      mockGetUserByEmail.mockResolvedValue(mockUser);

      const result = await getOrCreateFirebaseUser('test@test.com');
      expect(result).toBe(mockUser);
      expect(mockGetUserByEmail).toHaveBeenCalledWith('test@test.com');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('should create user if USER_NOT_FOUND', async () => {
      const mockUser = { uid: 'user-new' };
      mockGetUserByEmail.mockRejectedValue({ code: FIREBASE_ERRORS.USER_NOT_FOUND, message: 'Not found' });
      mockCreateUser.mockResolvedValue(mockUser);

      const result = await getOrCreateFirebaseUser('test@test.com');
      expect(result).toBe(mockUser);
      expect(mockCreateUser).toHaveBeenCalledWith({ email: 'test@test.com' });
    });

    it('should throw internal if create user fails', async () => {
      mockGetUserByEmail.mockRejectedValue({ code: FIREBASE_ERRORS.USER_NOT_FOUND, message: 'Not found' });
      mockCreateUser.mockRejectedValue(new Error('Create failed'));

      await expect(getOrCreateFirebaseUser('test@test.com')).rejects.toThrow(
        new HttpsError('internal', ERROR_MESSAGES.AUTH_SYSTEM_ERROR),
      );
    });

    it('should throw internal for other unknown errors in getUserByEmail', async () => {
      mockGetUserByEmail.mockRejectedValue(new Error('Random error'));

      await expect(getOrCreateFirebaseUser('test@test.com')).rejects.toThrow(
        new HttpsError('internal', ERROR_MESSAGES.AUTH_SYSTEM_ERROR),
      );
    });
  });
});
