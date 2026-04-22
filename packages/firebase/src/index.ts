import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';
import { FUNCTION_CONFIG } from '@unbogi/contracts';

admin.initializeApp();
setGlobalOptions({ region: FUNCTION_CONFIG.REGION });

// Export handlers
export * as auth from './handlers/auth';
export * as gifts from './handlers/gifts';
export * as contacts from './handlers/contacts';
export * as holidays from './handlers/holidays';
