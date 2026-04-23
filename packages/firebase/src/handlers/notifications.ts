import { COLLECTIONS, FUNCTION_CONFIG } from '@unbogi/contracts';
import { defineSecret } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { NotificationService } from '../services/notification';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const telegramBotUsername = defineSecret('TELEGRAM_BOT_USERNAME');

const notificationService = new NotificationService();

/**
 * Triggered when a gift document is created in Firestore.
 * 1. Sends "someone sent you a surprise" notification immediately.
 * 2. Schedules a Cloud Task to send "ready to open" at unpackDate.
 */
export const onGiftCreated = onDocumentCreated(
  {
    document: `${COLLECTIONS.GIFTS}/{giftId}`,
    region: FUNCTION_CONFIG.REGION,
    secrets: [telegramBotToken, telegramBotUsername],
  },
  async (event) => {
    const giftData = event.data?.data();
    if (!giftData) return;

    const { receiverId, unpackDate } = giftData;
    const botToken = telegramBotToken.value().trim();
    const botUsername = telegramBotUsername.value().trim();
    const giftId = event.params.giftId;

    // 1. Immediate notification: "someone sent you a surprise"
    await notificationService.sendGiftReceivedTelegram(botToken, botUsername, receiverId);

    // 2. Schedule "ready to open" notification at unpackDate
    if (unpackDate) {
      const unpackDateObj = unpackDate.toDate ? unpackDate.toDate() : new Date(unpackDate);
      await notificationService.scheduleGiftReadyTask(giftId, receiverId, unpackDateObj);
    }
  },
);

/**
 * Cloud Task handler: sends "gift ready to open" notification.
 * Dispatched at the gift's unpackDate.
 */
export const onGiftReadyTask = onTaskDispatched(
  {
    retryConfig: { maxAttempts: 3, minBackoffSeconds: 30 },
    rateLimits: { maxConcurrentDispatches: 10 },
    region: FUNCTION_CONFIG.REGION,
    secrets: [telegramBotToken, telegramBotUsername],
  },
  async (request) => {
    const { receiverId } = request.data as { giftId: string; receiverId: string };
    const botToken = telegramBotToken.value().trim();
    const botUsername = telegramBotUsername.value().trim();

    await notificationService.sendGiftReadyTelegram(botToken, botUsername, receiverId);
  },
);
