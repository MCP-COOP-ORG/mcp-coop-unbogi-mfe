/**
 * Firebase callable adapter — Web
 *
 * Re-exports Firebase JS SDK functions used across domain API clients and stores.
 * Metro (RN) will load callable.native.ts instead.
 */

export { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
export { httpsCallable } from 'firebase/functions';
