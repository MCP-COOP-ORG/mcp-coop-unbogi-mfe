// Constants
export { APP_CONFIG, AUTH_STATUS, type AuthStatus, CLOUD_FUNCTIONS, GIFT_CONFIG, OTP_CONFIG } from './constants';
export * from './domains/auth';
export * from './domains/contacts';
export * from './domains/gifts';
export * from './domains/holidays';
export * from './domains/invites';
// Firebase
export { app, auth, functions } from './firebase';
