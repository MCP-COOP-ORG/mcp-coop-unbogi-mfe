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
exports.verifyEmailOtp = exports.sendEmailOtp = exports.telegramAuth = void 0;
const https_1 = require("firebase-functions/v2/https");
const functions = __importStar(require("firebase-functions/v2"));
const contracts_1 = require("@unbogi/contracts");
const auth_1 = require("../services/auth");
const user_1 = require("../repositories/user");
const telegramBotToken = functions.params.defineSecret('TELEGRAM_BOT_TOKEN');
const resendApiKey = functions.params.defineSecret('RESEND_API_KEY');
const userRepository = new user_1.UserRepository();
const authService = new auth_1.AuthService(userRepository);
exports.telegramAuth = (0, https_1.onCall)({ secrets: [telegramBotToken], region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    const parsed = contracts_1.TelegramAuthSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    let botToken;
    try {
        botToken = telegramBotToken.value().trim();
    }
    catch (e) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }
    return await authService.authenticateWithTelegram(parsed.data, botToken);
});
exports.sendEmailOtp = (0, https_1.onCall)({ secrets: [resendApiKey], region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    const parsed = contracts_1.SendOtpSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }
    let apiKey;
    try {
        apiKey = resendApiKey.value().trim();
    }
    catch (e) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, 'Server configuration error: Resend API Key not found');
    }
    await authService.sendEmailOtp(parsed.data, apiKey);
    return { success: true };
});
exports.verifyEmailOtp = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    const parsed = contracts_1.VerifyOtpSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
    }
    return await authService.verifyEmailOtp(parsed.data);
});
//# sourceMappingURL=auth.js.map