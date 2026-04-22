import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { COLLECTIONS, FALLBACK_NAMES, PUSH_MESSAGES } from "@unbogi/contracts";

export class NotificationService {
  private get db() {
    return admin.firestore();
  }
  private get messaging() {
    return admin.messaging();
  }

  /**
   * Sends a push notification to the receiver when a gift is created
   */
  async sendGiftReceivedPush(giftId: string, senderId: string, receiverId: string): Promise<void> {
    try {
      // 1. Fetch receiver's FCM tokens
      const receiverDoc = await this.db.collection(COLLECTIONS.USERS).doc(receiverId).get();

      if (!receiverDoc.exists) {
        logger.warn(`Gift receiver ${receiverId} not found in users collection. Skipping push.`);
        return;
      }

      const tokens: string[] = receiverDoc.data()?.fcmTokens || [];
      if (tokens.length === 0) {
        logger.info(`User ${receiverId} has no FCM tokens. Skipping push.`);
        return;
      }

      // 2. Fetch sender name for notification body
      const senderDoc = await this.db.collection(COLLECTIONS.USERS).doc(senderId).get();
      const senderName = senderDoc.data()?.displayName 
        || senderDoc.data()?.nickname 
        || FALLBACK_NAMES.UNKNOWN;

      // 3. Construct and send message
      const message = {
        notification: {
          title: PUSH_MESSAGES.GIFT_RECEIVED_TITLE,
          body: PUSH_MESSAGES.giftReceivedBody(senderName),
        },
        data: { giftId },
        tokens,
      };

      const response = await this.messaging.sendEachForMulticast(message);
      logger.info(`Push sent to ${receiverId}: ${response.successCount} ok, ${response.failureCount} failed`);
    } catch (err) {
      logger.error(`Failed to send push to ${receiverId}:`, err);
    }
  }
}
