import { ERROR_CODES, ERROR_MESSAGES, GIFT_ERROR_MESSAGES } from '@unbogi/contracts';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContactRepository } from '../repositories/contact';
import type { GiftRepository } from '../repositories/gift';
import type { HolidayRepository } from '../repositories/holiday';
import { AppError } from '../utils/errors';
import { GiftService } from './gift';

vi.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: vi.fn().mockReturnValue('mock-server-timestamp'),
    },
  },
}));

vi.mock('firebase-functions/logger', () => ({
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('../utils/storage', () => ({
  mapTimestamp: vi.fn((ts) => (ts ? new Date(ts.toMillis()).toISOString() : null)),
  resolveStorageUrl: vi.fn().mockResolvedValue('https://mocked-url.com/image.png'),
}));

describe('GiftService (Unit)', () => {
  let giftService: GiftService;
  let mockGiftRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockContactRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockHolidayRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockGiftRepo = {
      createGift: vi.fn(),
      scratchGift: vi.fn(),
      getOpenedGifts: vi.fn(),
      getReceivedGifts: vi.fn(),
    };
    mockContactRepo = {
      areUsersConnected: vi.fn(),
    };
    mockHolidayRepo = {
      getHoliday: vi.fn(),
    };

    giftService = new GiftService(
      mockGiftRepo as unknown as GiftRepository,
      mockContactRepo as unknown as ContactRepository,
      mockHolidayRepo as unknown as HolidayRepository,
    );
  });

  describe('sendGift', () => {
    const defaultPayload = {
      idempotencyKey: 'key-123',
      receiverId: 'receiver-1',
      holidayId: 'holiday-1',
      greeting: 'Hello!',
      unpackDate: '2030-01-01T00:00:00Z',
      scratchCode: { value: 'CODE', format: 'code' as const },
    };

    it('should throw if sender is receiver', async () => {
      await expect(giftService.sendGift(defaultPayload, 'receiver-1')).rejects.toThrow(
        new HttpsError(ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode, GIFT_ERROR_MESSAGES.SELF_GIFT_FORBIDDEN),
      );
    });

    it('should throw if receiver is not in contacts', async () => {
      mockContactRepo.areUsersConnected.mockResolvedValue(false);
      await expect(giftService.sendGift(defaultPayload, 'sender-1')).rejects.toThrow(
        new HttpsError(
          ERROR_CODES.INVALID_ARGUMENT as FunctionsErrorCode,
          GIFT_ERROR_MESSAGES.RECEIVER_NOT_IN_CONTACTS,
        ),
      );
    });

    it('should throw if holiday is not found', async () => {
      mockContactRepo.areUsersConnected.mockResolvedValue(true);
      mockHolidayRepo.getHoliday.mockResolvedValue({ exists: false });
      await expect(giftService.sendGift(defaultPayload, 'sender-1')).rejects.toThrow(
        new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, GIFT_ERROR_MESSAGES.HOLIDAY_NOT_FOUND),
      );
    });

    it('should create gift and return giftId on success', async () => {
      mockContactRepo.areUsersConnected.mockResolvedValue(true);
      mockHolidayRepo.getHoliday.mockResolvedValue({ exists: true, data: () => ({ imageUrl: 'gs://url' }) });
      mockGiftRepo.createGift.mockResolvedValue(true);

      const result = await giftService.sendGift(defaultPayload, 'sender-1');

      expect(mockGiftRepo.createGift).toHaveBeenCalledWith(
        'key-123',
        expect.objectContaining({
          senderId: 'sender-1',
          receiverId: 'receiver-1',
          holidayId: 'holiday-1',
        }),
      );
      expect(result).toEqual({ giftId: 'key-123' });
    });

    it('should return existing id if idempotent duplicate', async () => {
      mockContactRepo.areUsersConnected.mockResolvedValue(true);
      mockHolidayRepo.getHoliday.mockResolvedValue({ exists: true, data: () => ({ imageUrl: 'gs://url' }) });
      mockGiftRepo.createGift.mockResolvedValue(false);

      const result = await giftService.sendGift(defaultPayload, 'sender-1');
      expect(result).toEqual({ giftId: 'key-123' });
    });
  });

  describe('scratchGift', () => {
    it('should scratch a gift successfully', async () => {
      mockGiftRepo.scratchGift.mockResolvedValue(undefined);
      const result = await giftService.scratchGift({ giftId: 'gift-1' }, 'caller-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw NOT_FOUND for AppError not-found', async () => {
      mockGiftRepo.scratchGift.mockRejectedValue(new AppError('not-found', 'Gift missing'));
      await expect(giftService.scratchGift({ giftId: 'gift-1' }, 'caller-1')).rejects.toThrow(
        new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, GIFT_ERROR_MESSAGES.GIFT_NOT_FOUND),
      );
    });

    it('should throw PERMISSION_DENIED for AppError permission-denied', async () => {
      mockGiftRepo.scratchGift.mockRejectedValue(new AppError('permission-denied', 'Denied'));
      await expect(giftService.scratchGift({ giftId: 'gift-1' }, 'caller-1')).rejects.toThrow(
        new HttpsError(ERROR_CODES.PERMISSION_DENIED as FunctionsErrorCode, GIFT_ERROR_MESSAGES.GIFT_ACCESS_DENIED),
      );
    });

    it('should throw INTERNAL for other errors', async () => {
      mockGiftRepo.scratchGift.mockRejectedValue(new Error('Unknown'));
      await expect(giftService.scratchGift({ giftId: 'gift-1' }, 'caller-1')).rejects.toThrow(
        new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR),
      );
    });

    it('should rethrow HttpsError directly', async () => {
      const err = new HttpsError('already-exists', 'Existing error');
      mockGiftRepo.scratchGift.mockRejectedValue(err);
      await expect(giftService.scratchGift({ giftId: 'gift-1' }, 'caller-1')).rejects.toThrow(err);
    });
  });

  describe('getOpenedGifts and getReceivedGifts', () => {
    const mockDocs = [
      {
        id: 'gift-1',
        data: () => ({
          senderId: 'sender-1',
          receiverId: 'receiver-1',
          holidayId: 'holiday-1',
          imageUrl: 'gs://url',
          greeting: 'Hi',
          unpackDate: { toMillis: () => 1600000000000 },
          scratchCode: 'CODE',
          scratchedAt: null,
          createdAt: { toMillis: () => 1600000000000 },
        }),
      },
    ];

    it('should return opened gifts mapped correctly', async () => {
      mockGiftRepo.getOpenedGifts.mockResolvedValue({ docs: mockDocs });
      const result = await giftService.getOpenedGifts('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toEqual('https://mocked-url.com/image.png');
    });

    it('should return received gifts mapped correctly', async () => {
      mockGiftRepo.getReceivedGifts.mockResolvedValue({ docs: mockDocs });
      const result = await giftService.getReceivedGifts('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toEqual('https://mocked-url.com/image.png');
    });
  });
});
