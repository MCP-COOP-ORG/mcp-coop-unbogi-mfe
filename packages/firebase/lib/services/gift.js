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
exports.GiftService = void 0;
const admin = __importStar(require('firebase-admin'));
const contracts_1 = require('@unbogi/contracts');
const https_1 = require('firebase-functions/v2/https');
const logger = __importStar(require('firebase-functions/logger'));
class GiftService {
  giftRepo;
  contactRepo;
  holidayRepo;
  constructor(giftRepo, contactRepo, holidayRepo) {
    this.giftRepo = giftRepo;
    this.contactRepo = contactRepo;
    this.holidayRepo = holidayRepo;
  }
  async sendGift(payload, senderId) {
    const { idempotencyKey, receiverId, holidayId, greeting, unpackDate, scratchCode } = payload;
    if (senderId === receiverId) {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.INVALID_ARGUMENT,
        contracts_1.GIFT_ERROR_MESSAGES.SELF_GIFT_FORBIDDEN,
      );
    }
    const areConnected = await this.contactRepo.areUsersConnected(senderId, receiverId);
    if (!areConnected) {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.INVALID_ARGUMENT,
        contracts_1.GIFT_ERROR_MESSAGES.RECEIVER_NOT_IN_CONTACTS,
      );
    }
    const holidaySnap = await this.holidayRepo.getHoliday(holidayId);
    if (!holidaySnap.exists) {
      throw new https_1.HttpsError(
        contracts_1.ERROR_CODES.NOT_FOUND,
        contracts_1.GIFT_ERROR_MESSAGES.HOLIDAY_NOT_FOUND,
      );
    }
    const holiday = holidaySnap.data();
    const success = await this.giftRepo.createGift(idempotencyKey, {
      senderId,
      receiverId,
      holidayId,
      imageUrl: typeof holiday.imageUrl === 'string' ? holiday.imageUrl : '',
      greeting,
      unpackDate: new Date(unpackDate),
      scratchCode,
      scratchedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (!success) {
      logger.info(`Duplicate gift request for key ${idempotencyKey}, returning existing id.`);
    } else {
      logger.info(`Gift ${idempotencyKey} sent from ${senderId} to ${receiverId}`);
    }
    return { giftId: idempotencyKey };
  }
  async scratchGift(payload, callerId) {
    try {
      await this.giftRepo.scratchGift(payload.giftId, callerId);
      logger.info(`Gift ${payload.giftId} scratched by ${callerId}`);
      return { success: true };
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.NOT_FOUND, contracts_1.GIFT_ERROR_MESSAGES.GIFT_NOT_FOUND);
      }
      if (err.message === 'PERMISSION_DENIED') {
        throw new https_1.HttpsError(
          contracts_1.ERROR_CODES.PERMISSION_DENIED,
          contracts_1.GIFT_ERROR_MESSAGES.GIFT_ACCESS_DENIED,
        );
      }
      throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }
  async getOpenedGifts(userId) {
    const snap = await this.giftRepo.getOpenedGifts(userId);
    return this.mapGiftDocs(snap.docs);
  }
  async getReceivedGifts(userId) {
    const snap = await this.giftRepo.getReceivedGifts(userId);
    return this.mapGiftDocs(snap.docs);
  }
  mapGiftDocs(docs) {
    return docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        holidayId: data.holidayId,
        imageUrl: data.imageUrl,
        greeting: data.greeting,
        unpackDate: data.unpackDate?.toDate()?.toISOString(),
        scratchCode: data.scratchCode,
        scratchedAt: data.scratchedAt?.toDate()?.toISOString(),
        createdAt: data.createdAt?.toDate()?.toISOString(),
      };
    });
  }
}
exports.GiftService = GiftService;
//# sourceMappingURL=gift.js.map
