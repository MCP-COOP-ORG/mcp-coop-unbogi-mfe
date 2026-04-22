'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.onGiftCreated = void 0;
const firestore_1 = require('firebase-functions/v2/firestore');
const contracts_1 = require('@unbogi/contracts');
const notification_1 = require('../services/notification');
const notificationService = new notification_1.NotificationService();
exports.onGiftCreated = (0, firestore_1.onDocumentCreated)(
  { document: `${contracts_1.COLLECTIONS.GIFTS}/{giftId}`, region: contracts_1.FUNCTION_CONFIG.REGION },
  async (event) => {
    const giftData = event.data?.data();
    if (!giftData) return;
    const { receiverId, senderId } = giftData;
    const giftId = event.params.giftId;
    await notificationService.sendGiftReceivedPush(giftId, senderId, receiverId);
  },
);
//# sourceMappingURL=notifications.js.map
