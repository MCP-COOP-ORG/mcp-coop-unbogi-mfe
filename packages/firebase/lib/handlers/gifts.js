"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceived = exports.getOpened = exports.scratch = exports.send = void 0;
const https_1 = require("firebase-functions/v2/https");
const contracts_1 = require("@unbogi/contracts");
const gift_1 = require("../services/gift");
const gift_2 = require("../repositories/gift");
const contact_1 = require("../repositories/contact");
const holiday_1 = require("../repositories/holiday");
const giftRepo = new gift_2.GiftRepository();
const contactRepo = new contact_1.ContactRepository();
const holidayRepo = new holiday_1.HolidayRepository();
const giftService = new gift_1.GiftService(giftRepo, contactRepo, holidayRepo);
exports.send = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }
    const parsed = contracts_1.SendGiftSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    return await giftService.sendGift(parsed.data, request.auth.uid);
});
exports.scratch = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }
    const parsed = contracts_1.ScratchGiftSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    return await giftService.scratchGift(parsed.data, request.auth.uid);
});
exports.getOpened = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }
    const gifts = await giftService.getOpenedGifts(request.auth.uid);
    return { gifts };
});
exports.getReceived = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }
    const gifts = await giftService.getReceivedGifts(request.auth.uid);
    return { gifts };
});
//# sourceMappingURL=gifts.js.map