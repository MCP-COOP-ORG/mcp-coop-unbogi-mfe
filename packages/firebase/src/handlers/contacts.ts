import { ERROR_CODES, ERROR_MESSAGES, FUNCTION_CONFIG } from '@unbogi/contracts';
import { type FunctionsErrorCode, HttpsError, onCall } from 'firebase-functions/v2/https';
import { ContactRepository } from '../repositories';
import { ContactService } from '../services';

// Dependencies composed at module level (singleton per cold-start)
const contactService = new ContactService(new ContactRepository());

/** Returns the authenticated user's contact list with resolved display names. */
export const list = onCall({ region: FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as FunctionsErrorCode, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
  }

  return contactService.listContacts(request.auth.uid);
});
