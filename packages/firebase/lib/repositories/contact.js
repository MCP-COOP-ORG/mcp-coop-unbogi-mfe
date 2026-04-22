"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepository = void 0;
const admin = __importStar(require("firebase-admin"));
const contracts_1 = require("@unbogi/contracts");
class ContactRepository {
    get db() {
        return admin.firestore();
    }
    async getContacts(ownerId) {
        return await this.db
            .collection(contracts_1.COLLECTIONS.CONTACTS)
            .where("ownerId", "==", ownerId)
            .get();
    }
    async areUsersConnected(userId1, userId2) {
        const snap = await this.db
            .collection(contracts_1.COLLECTIONS.CONTACTS)
            .where("ownerId", "==", userId1)
            .where("userId", "==", userId2)
            .limit(1)
            .get();
        return !snap.empty;
    }
    async getUsersByIds(userIds) {
        if (userIds.length === 0)
            return [];
        const userRefs = userIds.map((id) => this.db.collection(contracts_1.COLLECTIONS.USERS).doc(id));
        return await this.db.getAll(...userRefs);
    }
}
exports.ContactRepository = ContactRepository;
//# sourceMappingURL=contact.js.map