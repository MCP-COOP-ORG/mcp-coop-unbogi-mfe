import { COLLECTIONS, TG_MESSAGES } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
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
    try {
      // 1. Get receiver's telegramId
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

      // 2. Build inline keyboard with deep link to Mini App
      const miniAppLink = `https://t.me/${botUsername}/unbogi`;
      const payload = {
        chat_id: telegramId,
        text: TG_MESSAGES.GIFT_RECEIVED,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[{ text: TG_MESSAGES.GIFT_BUTTON_TEXT, url: miniAppLink }]],
        },
      };

      // 3. Call Telegram Bot API
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
