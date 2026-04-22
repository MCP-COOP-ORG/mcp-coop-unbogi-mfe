import { ContactRepository } from '../repositories/contact';
import { FALLBACK_NAMES } from '@unbogi/contracts';

export class ContactService {
  constructor(private contactRepo: ContactRepository) {}

  async listContacts(ownerId: string) {
    const contactsSnap = await this.contactRepo.getContacts(ownerId);
    
    if (contactsSnap.empty) {
      return { contacts: [] };
    }

    const userIds = contactsSnap.docs.map((doc) => doc.data().userId as string);
    const userSnaps = await this.contactRepo.getUsersByIds(userIds);

    const userMap = new Map<string, string>();
    userSnaps.forEach((snap) => {
      if (snap.exists) {
        const d = snap.data();
        userMap.set(snap.id, d?.displayName || d?.nickname || FALLBACK_NAMES.UNKNOWN);
      }
    });

    const contacts = contactsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.userId as string,
        displayName: userMap.get(data.userId) ?? FALLBACK_NAMES.UNKNOWN,
      };
    });

    return { contacts };
  }
}
