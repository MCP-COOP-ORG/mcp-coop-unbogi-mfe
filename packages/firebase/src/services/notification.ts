import { COLLECTIONS, TG_MESSAGES } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { getFunctions } from 'firebase-admin/functions';
import { logger } from 'firebase-functions/v2';

const TG_API = 'https://api.telegram.org/bot';

export class NotificationService {
  private get db() {
    return admin.firestore();
  }

  /**
   * Sends a Telegram message to the gift receiver via Bot API.
   * Message intentionally hides sender name for surprise effect.
   */
  async sendGiftReceivedTelegram(botToken: string, botUsername: string, receiverId: string): Promise<void> {
    await this.sendTelegramNotification(botToken, botUsername, receiverId, TG_MESSAGES.GIFT_RECEIVED);
  }

  /**
   * Sends a "gift ready to open" notification via Telegram Bot API.
   */
  async sendGiftReadyTelegram(botToken: string, botUsername: string, receiverId: string): Promise<void> {
    await this.sendTelegramNotification(botToken, botUsername, receiverId, TG_MESSAGES.GIFT_READY);
  }

  /**
   * Schedules a Cloud Task to send "gift ready" notification at unpackDate.
   */
  async scheduleGiftReadyTask(giftId: string, receiverId: string, unpackDate: Date): Promise<void> {
    const now = Date.now();
    const unpackTime = unpackDate.getTime();
    const delaySeconds = Math.max(0, Math.floor((unpackTime - now) / 1000));

    // If unpackDate is in the past or now, skip scheduling
    if (delaySeconds <= 0) {
      logger.info(`Gift ${giftId} unpackDate is in the past. Skipping ready task.`);
      return;
    }

    try {
      const queue = getFunctions().taskQueue('notifications-onGiftReadyTask');
      await queue.enqueue(
        { giftId, receiverId },
        { scheduleDelaySeconds: delaySeconds, dispatchDeadlineSeconds: 300 },
      );
      logger.info(`Scheduled gift-ready task for ${giftId} in ${delaySeconds}s`);
    } catch (err) {
      logger.error(`Failed to schedule gift-ready task for ${giftId}:`, err);
    }
  }

  /**
   * Shared method: sends a Telegram message with inline keyboard.
   */
  private async sendTelegramNotification(
    botToken: string,
    botUsername: string,
    receiverId: string,
    messageText: string,
  ): Promise<void> {
    try {
      const receiverDoc = await this.db.collection(COLLECTIONS.USERS).doc(receiverId).get();

      if (!receiverDoc.exists) {
        logger.warn(`Receiver ${receiverId} not found. Skipping TG notification.`);
        return;
      }

      const telegramId = receiverDoc.data()?.telegramId;
      if (!telegramId) {
        logger.info(`User ${receiverId} has no telegramId. Skipping.`);
        return;
      }

      const miniAppLink = `https://t.me/${botUsername}/unbogi`;
      const payload = {
        chat_id: telegramId,
        text: messageText,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[{ text: TG_MESSAGES.GIFT_BUTTON_TEXT, url: miniAppLink }]],
        },
      };

      const response = await fetch(`${TG_API}${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok: boolean; description?: string };

      if (!result.ok) {
        logger.error(`Telegram API error for ${receiverId}:`, result);
      } else {
        logger.info(`TG notification sent to user ${receiverId} (tgId: ${telegramId})`);
      }
    } catch (err) {
      logger.error(`Failed to send TG notification to ${receiverId}:`, err);
    }
  }
}
