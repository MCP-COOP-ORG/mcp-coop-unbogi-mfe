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
exports.GiftRepository = void 0;
const admin = __importStar(require('firebase-admin'));
const contracts_1 = require('@unbogi/contracts');
class GiftRepository {
  get db() {
    return admin.firestore();
  }
  get collection() {
    return this.db.collection(contracts_1.COLLECTIONS.GIFTS);
  }
  async createGift(idempotencyKey, data) {
    try {
      await this.collection.doc(idempotencyKey).create(data);
      return true;
    } catch (err) {
      if (err.code === contracts_1.FIREBASE_ERROR_CODES.ALREADY_EXISTS) {
        return false;
      }
      throw err;
    }
  }
  async getGift(giftId) {
    return await this.collection.doc(giftId).get();
  }
  async scratchGift(giftId, callerId) {
    await this.db.runTransaction(async (tx) => {
      const giftRef = this.collection.doc(giftId);
      const giftSnap = await tx.get(giftRef);
      if (!giftSnap.exists) {
        throw new Error('NOT_FOUND');
      }
      const gift = giftSnap.data();
      if (gift.receiverId !== callerId) {
        throw new Error('PERMISSION_DENIED');
      }
      if (gift.scratchedAt !== null) {
        return;
      }
      tx.update(giftRef, {
        scratchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  }
  async getOpenedGifts(userId) {
    return await this.collection
      .where('receiverId', '==', userId)
      .where('scratchedAt', '!=', null)
      .orderBy('scratchedAt', 'desc')
      .limit(50)
      .get();
  }
  async getReceivedGifts(userId) {
    return await this.collection
      .where('receiverId', '==', userId)
      .where('scratchedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
  }
}
exports.GiftRepository = GiftRepository;
//# sourceMappingURL=gift.js.map
