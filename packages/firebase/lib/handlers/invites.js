"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accept = exports.create = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const contracts_1 = require("@unbogi/contracts");
const invite_1 = require("../services/invite");
const inviteService = new invite_1.InviteService();
exports.create = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }
    const parsed = contracts_1.CreateInviteSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    const senderId = request.auth.uid;
    const result = await inviteService.createInvite(senderId, parsed.data);
    v2_1.logger.info(`Invite created by ${senderId}, token: ${result.token}`);
    return result;
});
exports.accept = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }
    const parsed = contracts_1.AcceptInviteSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    const acceptorId = request.auth.uid;
    try {
        const result = await inviteService.acceptInvite(acceptorId, parsed.data);
        v2_1.logger.info(`Invite ${parsed.data.token} accepted by ${acceptorId}`);
        return result;
    }
    catch (error) {
        v2_1.logger.error(`Failed to accept invite:`, error);
        // Convert ApplicationError to HttpsError
        const code = error.code || contracts_1.ERROR_CODES.INTERNAL;
        throw new https_1.HttpsError(code, error.message);
    }
});
//# sourceMappingURL=invites.js.map