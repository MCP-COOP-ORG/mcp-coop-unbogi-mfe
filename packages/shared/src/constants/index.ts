export const CLOUD_FUNCTIONS = {
  AUTH_TELEGRAM: 'auth-telegramAuth',
  AUTH_SEND_EMAIL_OTP: 'auth-sendEmailOtp',
  AUTH_VERIFY_EMAIL_OTP: 'auth-verifyEmailOtp',
  HOLIDAYS_LIST: 'holidays-list',
  INVITES_CREATE: 'invites-create',
  INVITES_ACCEPT: 'invites-accept',
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
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

export const GIFT_CONFIG = {
  GREETING_MAX_LENGTH: 200,
  CODE_MIN_LENGTH: 4,
  CODE_MAX_LENGTH: 30,
  CONTACT_SEARCH_MIN_CHARS: 2,
  CONTACT_SEARCH_MAX_RESULTS: 3,
} as const;
