export const COLLECTIONS = {
  USERS: "users",
  SYSTEM_OTP: "system_otp",
  INVITES: "invites",
  CONTACTS: "contacts",
  HOLIDAYS: "holidays",
  GIFTS: "gifts",
} as const;

export const PROVIDERS = {
  TELEGRAM: "telegram",
  EMAIL: "email",
  GOOGLE: "google",
} as const;

export const ERROR_MESSAGES = {
  INVALID_PAYLOAD: "Invalid payload",
  INVALID_TG_SIGNATURE: "Invalid Telegram signature",
  TG_USER_NOT_FOUND: "User data not found in initData",
  INVALID_EMAIL_FORMAT: "Invalid email format",
  FAILED_TO_SEND_EMAIL: "Failed to send email",
  NO_PENDING_OTP: "No pending OTP for this email",
  INVALID_OTP: "Invalid OTP code",
  EXPIRED_OTP: "OTP has expired",
  AUTH_SYSTEM_ERROR: "Auth system error",
  OTP_ATTEMPTS_EXCEEDED: "Too many failed attempts. Request a new code.",
  AUTHENTICATION_REQUIRED: "Authentication required.",
  TG_AUTH_REQUIRED: "Telegram authentication is required to register.",
  BOT_TOKEN_CONFIG_ERROR: "Server configuration error: Bot Token not found",
  BOT_TOKEN_MISSING: "Missing bot token configuration",
} as const;

export const ERROR_CODES = {
  INVALID_ARGUMENT: "invalid-argument",
  UNAUTHENTICATED: "unauthenticated",
  PERMISSION_DENIED: "permission-denied",
  NOT_FOUND: "not-found",
  INTERNAL: "internal",
} as const;

export const CONFIG = {
  OTP_LIFETIME_MS: 10 * 60 * 1000,
  MAX_OTP_ATTEMPTS: 5,
  TG_HMAC_CONSTANT: "WebAppData",
} as const;

export const EMAILS = {
  SENDER: 'UnBoGi Auth <auth@mcpcoop.org>',
  SUBJECT_OTP: 'Ваш код для входа',
  TEMPLATE_OTP: (code: string) => `<h1>${code}</h1><p>Код активен в течение 10 минут.</p>`,
} as const;

export const TELEGRAM_CONSTANTS = {
  HASH_PARAM: 'hash',
  USER_PARAM: 'user',
  ALGO: 'sha256',
  ENCODING: 'hex',
  UID_PREFIX: 'tg_',
  DEFAULT_NICKNAME: 'User',
} as const;

export const FIREBASE_ERRORS = {
  USER_NOT_FOUND: 'auth/user-not-found',
} as const;

export const LOGGING = {
  RESEND_ERROR: 'Resend API Error:',
} as const;

export const SCRATCH_CODE_FORMAT = {
  TEXT: 'text',
  LINK: 'link',
  QR: 'qr',
} as const;

export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
} as const;

export const GIFT_ERROR_MESSAGES = {
  RECEIVER_NOT_IN_CONTACTS: 'Receiver is not in your contacts',
  HOLIDAY_NOT_FOUND: 'Holiday not found',
  GIFT_NOT_FOUND: 'Gift not found',
  GIFT_ACCESS_DENIED: 'Access denied: you are not the receiver of this gift',
  INVITE_NOT_FOUND: 'Invite not found or already accepted',
  DUPLICATE_GIFT: 'A gift with this idempotency key already exists',
  SELF_GIFT_FORBIDDEN: 'Cannot send a gift to yourself',
  SELF_INVITE_FORBIDDEN: 'Cannot accept your own invite',
} as const;

export const FIREBASE_ERROR_CODES = {
  ALREADY_EXISTS: 6,
} as const;

export const FALLBACK_NAMES = {
  UNKNOWN: "Unknown",
} as const;

export const PUSH_MESSAGES = {
  GIFT_RECEIVED_TITLE: "🎁 New Gift!",
  giftReceivedBody: (senderName: string) => `${senderName} sent you a surprise!`,
} as const;

export const FUNCTION_CONFIG = {
  REGION: "europe-west1",
  MEMORY: "256MiB",
  TIMEOUT_SECONDS: 60,
} as const;
