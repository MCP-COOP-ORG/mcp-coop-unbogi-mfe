import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { ERROR_CODES, ERROR_MESSAGES, FUNCTION_CONFIG } from '@unbogi/contracts';
import { ContactService } from '../services/contact';
import { ContactRepository } from '../repositories/contact';

const contactRepo = new ContactRepository();
const contactService = new ContactService(contactRepo);

export const list = onCall(
  { region: FUNCTION_CONFIG.REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ERROR_CODES.UNAUTHENTICATED as any, ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
    }

    return await contactService.listContacts(request.auth.uid);
  }
);
