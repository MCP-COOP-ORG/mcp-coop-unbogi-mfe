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
exports.InviteRepository = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const contracts_1 = require("@unbogi/contracts");
class InviteRepository {
    db = admin.firestore();
    /**
     * Creates a new pending invite document
     */
    async createInvite(senderId) {
        const inviteRef = this.db.collection(contracts_1.COLLECTIONS.INVITES).doc();
        const token = inviteRef.id;
        await inviteRef.set({
            senderId,
            token,
            status: contracts_1.INVITE_STATUS.PENDING,
            acceptedBy: null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return token;
    }
    /**
     * Runs the acceptance transaction: marks invite as ACCEPTED and creates a deterministic contact entry.
     * Deterministic contact ID prevents duplicate contacts between the same users.
     */
    async runAcceptInviteTransaction(token, acceptorId) {
        const inviteRef = this.db.collection(contracts_1.COLLECTIONS.INVITES).doc(token);
        await this.db.runTransaction(async (tx) => {
            const inviteSnap = await tx.get(inviteRef);
            if (!inviteSnap.exists) {
                throw new Error("NOT_FOUND");
            }
            const invite = inviteSnap.data();
            // Idempotent: if Bob already accepted this invite, return ok silently
            if (invite.status === contracts_1.INVITE_STATUS.ACCEPTED && invite.acceptedBy === acceptorId) {
                return;
            }
            if (invite.status !== contracts_1.INVITE_STATUS.PENDING) {
                throw new Error("NOT_FOUND");
            }
            // Prevent self-invite
            if (invite.senderId === acceptorId) {
                throw new Error("INVALID_ARGUMENT");
            }
            // Deterministic contact ID: sender_acceptor
            const contactId = `${invite.senderId}_${acceptorId}`;
            const contactRef = this.db.collection(contracts_1.COLLECTIONS.CONTACTS).doc(contactId);
            tx.set(contactRef, {
                ownerId: invite.senderId,
                userId: acceptorId,
                addedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            tx.update(inviteRef, {
                status: contracts_1.INVITE_STATUS.ACCEPTED,
                acceptedBy: acceptorId,
            });
        });
    }
}
exports.InviteRepository = InviteRepository;
//# sourceMappingURL=invite.js.map