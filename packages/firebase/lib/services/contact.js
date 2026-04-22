"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const contracts_1 = require("@unbogi/contracts");
class ContactService {
    contactRepo;
    constructor(contactRepo) {
        this.contactRepo = contactRepo;
    }
    async listContacts(ownerId) {
        const contactsSnap = await this.contactRepo.getContacts(ownerId);
        if (contactsSnap.empty) {
            return { contacts: [] };
        }
        const userIds = contactsSnap.docs.map((doc) => doc.data().userId);
        const userSnaps = await this.contactRepo.getUsersByIds(userIds);
        const userMap = new Map();
        userSnaps.forEach((snap) => {
            if (snap.exists) {
                const d = snap.data();
                userMap.set(snap.id, d?.displayName || d?.nickname || contracts_1.FALLBACK_NAMES.UNKNOWN);
            }
        });
        const contacts = contactsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: data.userId,
                displayName: userMap.get(data.userId) ?? contracts_1.FALLBACK_NAMES.UNKNOWN,
            };
        });
        return { contacts };
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=contact.js.map