/**
 * Firebase platform adapter — Web (Vite / TMA)
 *
 * Initializes the Firebase JS SDK for browser environments.
 * Metro (RN) will never load this file — it picks init.native.ts instead.
 */
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.UNBOGI_FIREBASE_API_KEY,
  authDomain: import.meta.env.UNBOGI_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.UNBOGI_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.UNBOGI_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.UNBOGI_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.UNBOGI_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'europe-west1');

// App Check with reCAPTCHA v3 — only active in production.
// The emulator accepts unauthenticated requests in DEV mode automatically.
// Site key is public (safe to commit — analogous to a Google Maps key).
if (!import.meta.env.DEV) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LfUvMYsAAAAABJPBuDVHG7UbMgZAnnTLGpm-gUI'),
    isTokenAutoRefreshEnabled: true,
  });
}

// Emulator support for local development
if (import.meta.env.DEV && import.meta.env.UNBOGI_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
