'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.list = void 0;
const https_1 = require('firebase-functions/v2/https');
const contracts_1 = require('@unbogi/contracts');
const contact_1 = require('../services/contact');
const contact_2 = require('../repositories/contact');
const contactRepo = new contact_2.ContactRepository();
const contactService = new contact_1.ContactService(contactRepo);
exports.list = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async (request) => {
  if (!request.auth) {
    throw new https_1.HttpsError(
      contracts_1.ERROR_CODES.UNAUTHENTICATED,
      contracts_1.ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
    );
  }
  return await contactService.listContacts(request.auth.uid);
});
//# sourceMappingURL=contacts.js.map
