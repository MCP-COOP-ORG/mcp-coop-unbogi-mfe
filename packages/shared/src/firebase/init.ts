/**
 * Firebase init — default resolution target (web/Vite).
 *
 * Vite does NOT resolve .web.ts extensions automatically,
 * so this plain .ts file serves as the Vite entry.
 * Metro (RN) will skip this and resolve init.native.ts instead.
 */
export { app, auth, functions } from './init.web';
