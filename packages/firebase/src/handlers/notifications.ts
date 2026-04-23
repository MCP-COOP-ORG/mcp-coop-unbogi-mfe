import { COLLECTIONS, FUNCTION_CONFIG } from '@unbogi/contracts';
import { defineSecret } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { UserRepository } from '../repositories';
import { NotificationService } from '../services';

const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN');
const telegramBotUsername = defineSecret('TELEGRAM_BOT_USERNAME');

// Dependencies composed at module level (singleton per cold-start)
const notificationService = new NotificationService(new UserRepository());

/**
 * Triggered when a gift document is created.
 * 1. Immediately notifies the receiver: "someone sent you a surprise".
 * 2. Schedules a Cloud Task to send "gift ready to open" at `unpackDate`.
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

    // Step 1: immediate surprise notification
    await notificationService.sendGiftReceivedTelegram(botToken, botUsername, receiverId);

    // Step 2: schedule "ready to open" notification for unpackDate
    if (unpackDate) {
      const unpackDateObj = unpackDate.toDate ? unpackDate.toDate() : new Date(unpackDate);
      await notificationService.scheduleGiftReadyTask(giftId, receiverId, unpackDateObj);
    }
  },
);

/**
 * Cloud Task handler: sends the "gift is ready to open" notification.
 * Dispatched at the gift's `unpackDate` by `onGiftCreated`.
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
