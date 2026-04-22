'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotificationService = void 0;
const admin = __importStar(require('firebase-admin'));
const v2_1 = require('firebase-functions/v2');
const contracts_1 = require('@unbogi/contracts');
class NotificationService {
  db = admin.firestore();
  messaging = admin.messaging();
  /**
   * Sends a push notification to the receiver when a gift is created
   */
  async sendGiftReceivedPush(giftId, senderId, receiverId) {
    try {
      // 1. Fetch receiver's FCM tokens
      const receiverDoc = await this.db.collection(contracts_1.COLLECTIONS.USERS).doc(receiverId).get();
      if (!receiverDoc.exists) {
        v2_1.logger.warn(`Gift receiver ${receiverId} not found in users collection. Skipping push.`);
        return;
      }
      const tokens = receiverDoc.data()?.fcmTokens || [];
      if (tokens.length === 0) {
        v2_1.logger.info(`User ${receiverId} has no FCM tokens. Skipping push.`);
        return;
      }
      // 2. Fetch sender name for notification body
      const senderDoc = await this.db.collection(contracts_1.COLLECTIONS.USERS).doc(senderId).get();
      const senderName =
        senderDoc.data()?.displayName || senderDoc.data()?.nickname || contracts_1.FALLBACK_NAMES.UNKNOWN;
      // 3. Construct and send message
      const message = {
        notification: {
          title: contracts_1.PUSH_MESSAGES.GIFT_RECEIVED_TITLE,
          body: contracts_1.PUSH_MESSAGES.giftReceivedBody(senderName),
        },
        data: { giftId },
        tokens,
      };
      const response = await this.messaging.sendEachForMulticast(message);
      v2_1.logger.info(`Push sent to ${receiverId}: ${response.successCount} ok, ${response.failureCount} failed`);
    } catch (err) {
      v2_1.logger.error(`Failed to send push to ${receiverId}:`, err);
    }
  }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.js.map
