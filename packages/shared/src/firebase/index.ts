/**
 * Firebase barrel — platform-agnostic re-exports.
 *
 * Platform resolution:
 * - Vite (TMA/web) → resolves init.web.ts, callable.web.ts
 * - Metro (RN/mobile) → resolves init.native.ts, callable.native.ts
 *
 * Consumers import from this barrel: `import { auth, functions } from '../../firebase'`
 */

// ── Platform-resolved callable helpers ──────────────────────────────────────────
export { httpsCallable, onAuthStateChanged, signInWithCustomToken } from './callable';
// ── Platform-resolved Firebase instances ────────────────────────────────────────
export { app, auth, functions } from './init';
