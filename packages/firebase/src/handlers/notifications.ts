import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { COLLECTIONS, FUNCTION_CONFIG } from "@unbogi/contracts";
import { NotificationService } from "../services/notification";

const notificationService = new NotificationService();

export const onGiftCreated = onDocumentCreated(
  { document: `${COLLECTIONS.GIFTS}/{giftId}`, region: FUNCTION_CONFIG.REGION },
  async (event) => {
    const giftData = event.data?.data();
    if (!giftData) return;

    const { receiverId, senderId } = giftData;
    const giftId = event.params.giftId;

    await notificationService.sendGiftReceivedPush(giftId, senderId, receiverId);
  }
);
