/**
 * Firebase callable — default resolution target (web/Vite).
 *
 * Same pattern as init.ts: Vite uses this, Metro resolves callable.native.ts.
 */
export { httpsCallable, onAuthStateChanged, signInWithCustomToken } from './callable.web';
