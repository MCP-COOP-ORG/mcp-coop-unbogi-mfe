import { CLOUD_FUNCTIONS } from '../../constants';
import { functions, httpsCallable } from '../../firebase';
import type { Contact } from './types';

export const contactsApi = {
  async list(): Promise<Contact[]> {
    const fn = httpsCallable<Record<string, never>, { contacts: Contact[] }>(functions, CLOUD_FUNCTIONS.CONTACTS_LIST);
    const { data } = await fn({});
    return data.contacts;
  },
};
