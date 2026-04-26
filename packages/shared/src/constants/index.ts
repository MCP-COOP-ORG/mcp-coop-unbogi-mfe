export const CLOUD_FUNCTIONS = {
  AUTH_TELEGRAM: 'auth-telegramAuth',
  AUTH_SEND_EMAIL_OTP: 'auth-sendEmailOtp',
  AUTH_VERIFY_EMAIL_OTP: 'auth-verifyEmailOtp',
  HOLIDAYS_LIST: 'holidays-list',
  INVITES_CREATE: 'invites-create',
  INVITES_ACCEPT: 'invites-accept',
  INVITES_SEND_EMAIL: 'invites-sendEmailInvite',
  INVITES_REDEEM_EMAIL: 'invites-redeemEmailInvite',
  CONTACTS_LIST: 'contacts-list',
  GIFTS_SEND: 'gifts-send',
  GIFTS_GET_RECEIVED: 'gifts-getReceived',
  GIFTS_GET_OPENED: 'gifts-getOpened',
  GIFTS_SCRATCH: 'gifts-scratch',
} as const;

export const AUTH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  /**
   * TG identification succeeded but the user is not registered.
   * OTP flow is required to bind an email.
   */
  EMAIL_REQUIRED: 'email_required',
  /**
   * Authentication failed after all retry attempts.
   * Shows a "service unavailable" screen with a retry button.
   */
  AUTH_ERROR: 'auth_error',
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

/**
 * OTP configuration — single source of truth shared between client and backend.
 * Backend uses CONFIG.OTP_LIFETIME_MS from @unbogi/contracts (same value).
 */
export const OTP_CONFIG = {
  LIFETIME_MS: 10 * 60 * 1000, // 10 minutes
} as const;

export const GIFT_CONFIG = {
  GREETING_MAX_LENGTH: 250,
  CODE_MIN_LENGTH: 4,
  CODE_MAX_LENGTH: 30,
  CONTACT_SEARCH_MIN_CHARS: 2,
  /** Maximum contacts returned in dropdown (change here to reconfigure) */
  CONTACT_SEARCH_MAX_RESULTS: 5,
  /** Visible rows before scroll kicks in (change here to reconfigure) */
  CONTACT_DROPDOWN_VISIBLE_ROWS: 5,
} as const;

export const APP_CONFIG = {
  DEFAULT_LOCALE: 'en-US',
} as const;
