import { TELEGRAM_BOT_API_URL, TG_MESSAGES } from '@unbogi/contracts';
import { getFunctions } from 'firebase-admin/functions';
import { logger } from 'firebase-functions/v2';
import type { UserRepository } from '../repositories/user';

export class NotificationService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Sends an immediate "someone sent you a surprise" Telegram notification to the receiver.
   * Sender identity is intentionally hidden for the surprise effect.
   */
  async sendGiftReceivedTelegram(botToken: string, botUsername: string, receiverId: string): Promise<void> {
    await this.sendTelegramNotification(botToken, botUsername, receiverId, TG_MESSAGES.GIFT_RECEIVED);
  }

  /** Sends a "your gift is ready to open" Telegram notification to the receiver. */
  async sendGiftReadyTelegram(botToken: string, botUsername: string, receiverId: string): Promise<void> {
    await this.sendTelegramNotification(botToken, botUsername, receiverId, TG_MESSAGES.GIFT_READY);
  }

  /**
   * Schedules a Cloud Task to deliver the "gift ready" notification at `unpackDate`.
   * Skips scheduling when `unpackDate` is in the past.
   */
  async scheduleGiftReadyTask(giftId: string, receiverId: string, unpackDate: Date): Promise<void> {
    const delaySeconds = Math.max(0, Math.floor((unpackDate.getTime() - Date.now()) / 1000));

    if (delaySeconds <= 0) {
      logger.info(`[NotificationService] Gift ${giftId} unpackDate is in the past — skipping task`);
      return;
    }

    try {
      const queue = getFunctions().taskQueue('notifications-onGiftReadyTask');
      await queue.enqueue({ giftId, receiverId }, { scheduleDelaySeconds: delaySeconds, dispatchDeadlineSeconds: 300 });
      logger.info(`[NotificationService] Scheduled gift-ready task for ${giftId} in ${delaySeconds}s`);
    } catch (err) {
      logger.error(`[NotificationService] Failed to schedule task for ${giftId}:`, err);
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Looks up the receiver's `telegramId` via `UserRepository` and sends a Telegram message
   * with an inline keyboard. Silently skips if the user or `telegramId` is not found.
   */
  private async sendTelegramNotification(
    botToken: string,
    botUsername: string,
    receiverId: string,
    messageText: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findById(receiverId);

      if (!user) {
        logger.warn(`[NotificationService] Receiver ${receiverId} not found — skipping TG notification`);
        return;
      }

      if (!user.telegramId) {
        logger.info(`[NotificationService] User ${receiverId} has no telegramId — skipping`);
        return;
      }

      const miniAppUrl = `https://t.me/${botUsername}/unbogi`;
      const payload = {
        chat_id: user.telegramId,
        text: messageText,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[{ text: TG_MESSAGES.GIFT_BUTTON_TEXT, url: miniAppUrl }]],
        },
      };

      const response = await fetch(`${TELEGRAM_BOT_API_URL}${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok: boolean; description?: string };

      if (!result.ok) {
        logger.error(`[NotificationService] Telegram API error for ${receiverId}:`, result);
      } else {
        logger.info(`[NotificationService] TG notification sent to ${receiverId} (tgId: ${user.telegramId})`);
      }
    } catch (err) {
      logger.error(`[NotificationService] Failed to send TG notification to ${receiverId}:`, err);
    }
  }
}
