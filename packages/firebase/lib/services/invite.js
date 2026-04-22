"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteService = void 0;
const invite_1 = require("../repositories/invite");
class InviteService {
    repository = new invite_1.InviteRepository();
    /**
     * Creates a new invite and returns the token
     */
    async createInvite(senderId, _payload) {
        const token = await this.repository.createInvite(senderId);
        return { token };
    }
    /**
     * Accepts an invite and creates a contact entry
     */
    async acceptInvite(acceptorId, payload) {
        await this.repository.runAcceptInviteTransaction(payload.token, acceptorId);
        return { success: true };
    }
}
exports.InviteService = InviteService;
//# sourceMappingURL=invite.js.map