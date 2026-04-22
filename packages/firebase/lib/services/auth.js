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
exports.AuthService = void 0;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const contracts_1 = require("@unbogi/contracts");
const https_1 = require("firebase-functions/v2/https");
const resend_1 = require("resend");
const errors_1 = require("../utils/errors");
const logger = __importStar(require("firebase-functions/logger"));
class AuthService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async authenticateWithTelegram(payload, botToken) {
        const { initData } = payload;
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get(contracts_1.TELEGRAM_CONSTANTS.HASH_PARAM);
        if (!hash) {
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
        }
        urlParams.delete(contracts_1.TELEGRAM_CONSTANTS.HASH_PARAM);
        // Sort keys alphabetically using strict ASCII comparison
        const keys = Array.from(urlParams.keys()).sort((a, b) => a < b ? -1 : (a > b ? 1 : 0));
        const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n');
        const validParams = keys.map(key => ({ key, value: urlParams.get(key) }));
        const secretKey = crypto.createHmac(contracts_1.TELEGRAM_CONSTANTS.ALGO, contracts_1.CONFIG.TG_HMAC_CONSTANT).update(botToken).digest();
        const calculatedHash = crypto.createHmac(contracts_1.TELEGRAM_CONSTANTS.ALGO, secretKey).update(dataCheckString).digest(contracts_1.TELEGRAM_CONSTANTS.ENCODING);
        const hashBuffer = Buffer.from(hash, contracts_1.TELEGRAM_CONSTANTS.ENCODING);
        const calcBuffer = Buffer.from(calculatedHash, contracts_1.TELEGRAM_CONSTANTS.ENCODING);
        if (hashBuffer.length !== calcBuffer.length || !crypto.timingSafeEqual(hashBuffer, calcBuffer)) {
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.INVALID_TG_SIGNATURE);
        }
        const userParamObj = validParams.find(p => p.key === contracts_1.TELEGRAM_CONSTANTS.USER_PARAM);
        const userStr = userParamObj ? userParamObj.value : undefined;
        if (!userStr) {
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.TG_USER_NOT_FOUND);
        }
        let tgUser;
        try {
            tgUser = JSON.parse(userStr);
        }
        catch {
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.INVALID_ARGUMENT, contracts_1.ERROR_MESSAGES.INVALID_PAYLOAD);
        }
        const uid = `${contracts_1.TELEGRAM_CONSTANTS.UID_PREFIX}${tgUser.id}`;
        await this.userRepository.upsertUser(uid, {
            uid,
            nickname: tgUser.username || tgUser.first_name || contracts_1.TELEGRAM_CONSTANTS.DEFAULT_NICKNAME,
            telegramId: tgUser.id,
            provider: contracts_1.PROVIDERS.TELEGRAM,
        });
        const customToken = await admin.auth().createCustomToken(uid);
        return { token: customToken };
    }
    async sendEmailOtp(payload, resendApiKey) {
        const { email } = payload;
        const otpCode = crypto.randomInt(100_000, 999_999).toString();
        const expiresAt = new Date(Date.now() + contracts_1.CONFIG.OTP_LIFETIME_MS);
        const db = admin.firestore();
        await db.doc(`${contracts_1.COLLECTIONS.SYSTEM_OTP}/${email}`).set({
            code: otpCode,
            attempts: 0,
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
        });
        const resend = new resend_1.Resend(resendApiKey);
        const { error } = await resend.emails.send({
            from: contracts_1.EMAILS.SENDER,
            to: email,
            subject: contracts_1.EMAILS.SUBJECT_OTP,
            html: contracts_1.EMAILS.TEMPLATE_OTP(otpCode),
        });
        if (error) {
            logger.error('Resend API Error:', error);
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
        }
    }
    async verifyEmailOtp(payload) {
        const { email, code } = payload;
        const db = admin.firestore();
        const otpRef = db.doc(`${contracts_1.COLLECTIONS.SYSTEM_OTP}/${email}`);
        const otpDoc = await otpRef.get();
        if (!otpDoc.exists) {
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.NOT_FOUND, contracts_1.ERROR_MESSAGES.NO_PENDING_OTP);
        }
        const data = otpDoc.data();
        if (!data || (data.attempts || 0) >= contracts_1.CONFIG.MAX_OTP_ATTEMPTS) {
            await otpRef.delete();
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.OTP_ATTEMPTS_EXCEEDED);
        }
        if (data.code !== code) {
            await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.INVALID_OTP);
        }
        if (data.expiresAt.toDate() < new Date()) {
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.UNAUTHENTICATED, contracts_1.ERROR_MESSAGES.EXPIRED_OTP);
        }
        await otpRef.delete();
        try {
            let userRecord;
            try {
                userRecord = await admin.auth().getUserByEmail(email);
            }
            catch (err) {
                if ((0, errors_1.isFirebaseError)(err) && err.code === contracts_1.FIREBASE_ERRORS.USER_NOT_FOUND) {
                    try {
                        userRecord = await admin.auth().createUser({ email });
                    }
                    catch (createErr) {
                        logger.error('[verifyEmailOtp] Error creating user:', createErr);
                        throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
                    }
                }
                else {
                    logger.error('[verifyEmailOtp] Error getting user by email:', err);
                    throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
                }
            }
            const uid = userRecord.uid;
            await this.userRepository.upsertUser(uid, {
                uid,
                email,
                provider: contracts_1.PROVIDERS.EMAIL,
            });
            const customToken = await admin.auth().createCustomToken(uid);
            return { token: customToken };
        }
        catch (err) {
            if (err instanceof https_1.HttpsError)
                throw err;
            logger.error('[verifyEmailOtp] Unhandled error after OTP match:', err);
            throw new https_1.HttpsError(contracts_1.ERROR_CODES.INTERNAL, contracts_1.ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map