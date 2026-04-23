import { FUNCTION_CONFIG } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

// ─── Runtime Initialisation ───────────────────────────────────────────────────
// Must run before any handler imports that reference firebase-admin or firebase-functions.
admin.initializeApp();
setGlobalOptions({ region: FUNCTION_CONFIG.REGION });

// ─── Handler Re-exports ───────────────────────────────────────────────────────
export * as auth from './handlers/auth';
export * as contacts from './handlers/contacts';
export * as gifts from './handlers/gifts';
export * as holidays from './handlers/holidays';
export * as invites from './handlers/invites';
export * as notifications from './handlers/notifications';

// ─── Infrastructure Endpoints ─────────────────────────────────────────────────

/**
 * Health-check endpoint.
 * Validates that the Cloud Functions runtime environment is operational.
 */
export const ping = onRequest({ cors: ['https://mcpcoop.org'], region: FUNCTION_CONFIG.REGION }, (_req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'unbogi-core',
    timestamp: Date.now(),
  });
});
