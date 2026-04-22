"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailOtp = exports.sendEmailOtp = exports.telegramAuth = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const contracts_1 = require("@unbogi/contracts");
const auth_1 = require("../services/auth");
const user_1 = require("../repositories/user");
const telegramBotToken = (0, params_1.defineSecret)('TELEGRAM_BOT_TOKEN');
const resendApiKey = (0, params_1.defineSecret)('RESEND_API_KEY');
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
    catch {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }
    // Возвращает { token?, hasEmail } — token только если пользователь уже зарегистрирован
    return await authService.authenticateWithTelegram(parsed.data, botToken);
});
exports.sendEmailOtp = (0, https_1.onCall)(
// botToken нужен для валидации initData внутри sendEmailOtp
{ secrets: [telegramBotToken, resendApiKey], region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
    const parsed = contracts_1.SendOtpSchema.safeParse(request.data);
    if (!parsed.success) {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }
    let botToken;
    let apiKey;
    try {
        botToken = telegramBotToken.value().trim();
        apiKey = resendApiKey.value().trim();
    }
    catch {
        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.BOT_TOKEN_CONFIG_ERROR);
    }
    await authService.sendEmailOtp(parsed.data, botToken, apiKey);
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