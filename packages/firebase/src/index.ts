import { FUNCTION_CONFIG } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

admin.initializeApp();
setGlobalOptions({ region: FUNCTION_CONFIG.REGION });

import { onRequest } from 'firebase-functions/v2/https';

// Export handlers
export * as auth from './handlers/auth';
export * as contacts from './handlers/contacts';
export * as gifts from './handlers/gifts';
export * as holidays from './handlers/holidays';
export * as invites from './handlers/invites';
export * as notifications from './handlers/notifications';

/**
 * System Health Endpoint
 * Performs foundational validation of the Cloud Functions runtime environment.
 */
export const ping = onRequest({ cors: ['https://mcpcoop.org'], region: FUNCTION_CONFIG.REGION }, (_req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'unbogi-core',
    timestamp: Date.now(),
  });
});
