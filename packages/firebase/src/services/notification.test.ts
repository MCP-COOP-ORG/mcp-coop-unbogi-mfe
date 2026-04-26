import { TELEGRAM_BOT_API_URL, TG_MESSAGES } from '@unbogi/contracts';
import { getFunctions } from 'firebase-admin/functions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserRepository } from '../repositories/user';
import { NotificationService } from './notification';

vi.mock('firebase-admin/functions', () => ({
  getFunctions: vi.fn(),
}));

vi.mock('firebase-functions/v2', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('NotificationService (Unit)', () => {
  let notificationService: NotificationService;
  let mockUserRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockTaskQueue: Record<string, ReturnType<typeof vi.fn>>;
  let globalFetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = {
      findById: vi.fn(),
    };
    mockTaskQueue = {
      enqueue: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getFunctions).mockReturnValue({
      taskQueue: vi.fn().mockReturnValue(mockTaskQueue),
    } as unknown as ReturnType<typeof getFunctions>);

    notificationService = new NotificationService(mockUserRepo as unknown as UserRepository);

    globalFetchMock = vi.fn();
    global.fetch = globalFetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendGiftReceivedTelegram', () => {
    it('should silently skip if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);
      await notificationService.sendGiftReceivedTelegram('bot-token', 'bot-username', 'receiver-1');
      expect(globalFetchMock).not.toHaveBeenCalled();
    });

    it('should silently skip if user has no telegramId', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'receiver-1' });
      await notificationService.sendGiftReceivedTelegram('bot-token', 'bot-username', 'receiver-1');
      expect(globalFetchMock).not.toHaveBeenCalled();
    });

    it('should call fetch to send telegram message', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'receiver-1', telegramId: 12345 });
      globalFetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ ok: true }),
      });

      await notificationService.sendGiftReceivedTelegram('bot-token', 'bot-username', 'receiver-1');

      expect(globalFetchMock).toHaveBeenCalledWith(
        `${TELEGRAM_BOT_API_URL}bot-token/sendMessage`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('12345'),
        }),
      );
    });

    it('should handle fetch errors gracefully', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'receiver-1', telegramId: 12345 });
      globalFetchMock.mockRejectedValue(new Error('Network error'));

      await notificationService.sendGiftReceivedTelegram('bot-token', 'bot-username', 'receiver-1');
      // Should not throw
      expect(globalFetchMock).toHaveBeenCalled();
    });
  });

  describe('sendGiftReadyTelegram', () => {
    it('should call fetch with gift ready message', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'receiver-1', telegramId: 12345 });
      globalFetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ ok: true }),
      });

      await notificationService.sendGiftReadyTelegram('bot-token', 'bot-username', 'receiver-1');

      expect(globalFetchMock).toHaveBeenCalled();
      const fetchArgs = globalFetchMock.mock.calls[0];
      expect(fetchArgs[0]).toBe(`${TELEGRAM_BOT_API_URL}bot-token/sendMessage`);
      const body = JSON.parse(fetchArgs[1].body);
      expect(body.text).toBe(TG_MESSAGES.GIFT_READY);
    });
  });

  describe('scheduleGiftReadyTask', () => {
    it('should skip scheduling if delay is <= 0', async () => {
      const pastDate = new Date(Date.now() - 10000);
      await notificationService.scheduleGiftReadyTask('gift-1', 'receiver-1', pastDate);
      expect(getFunctions).not.toHaveBeenCalled();
    });

    it('should schedule task if delay is positive', async () => {
      const futureDate = new Date(Date.now() + 100000); // ~100s in future
      await notificationService.scheduleGiftReadyTask('gift-1', 'receiver-1', futureDate);

      expect(getFunctions).toHaveBeenCalled();
      expect(mockTaskQueue.enqueue).toHaveBeenCalledWith(
        { giftId: 'gift-1', receiverId: 'receiver-1' },
        expect.objectContaining({
          scheduleDelaySeconds: expect.any(Number),
          dispatchDeadlineSeconds: 300,
        }),
      );
    });
  });
});
