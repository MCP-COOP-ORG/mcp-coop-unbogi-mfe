import { COLLECTIONS, FUNCTION_CONFIG } from '@unbogi/contracts';
import { defineSecret } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { NotificationService } from '../services/notification';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const telegramBotUsername = defineSecret('TELEGRAM_BOT_USERNAME');

const notificationService = new NotificationService();

export const onGiftCreated = onDocumentCreated(
  {
    document: `${COLLECTIONS.GIFTS}/{giftId}`,
    region: FUNCTION_CONFIG.REGION,
    secrets: [telegramBotToken, telegramBotUsername],
  },
  async (event) => {
    const giftData = event.data?.data();
    if (!giftData) return;

    const { receiverId } = giftData;
    const botToken = telegramBotToken.value().trim();
    const botUsername = telegramBotUsername.value().trim();

    await notificationService.sendGiftReceivedTelegram(botToken, botUsername, receiverId);
  },
);
