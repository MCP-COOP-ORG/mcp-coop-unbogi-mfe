'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.ping =
  exports.notifications =
  exports.invites =
  exports.holidays =
  exports.contacts =
  exports.gifts =
  exports.auth =
    void 0;
const admin = __importStar(require('firebase-admin'));
const v2_1 = require('firebase-functions/v2');
const contracts_1 = require('@unbogi/contracts');
admin.initializeApp();
(0, v2_1.setGlobalOptions)({ region: contracts_1.FUNCTION_CONFIG.REGION });
const https_1 = require('firebase-functions/v2/https');
// Export handlers
exports.auth = __importStar(require('./handlers/auth'));
exports.gifts = __importStar(require('./handlers/gifts'));
exports.contacts = __importStar(require('./handlers/contacts'));
exports.holidays = __importStar(require('./handlers/holidays'));
exports.invites = __importStar(require('./handlers/invites'));
exports.notifications = __importStar(require('./handlers/notifications'));
/**
 * System Health Endpoint
 * Performs foundational validation of the Cloud Functions runtime environment.
 */
exports.ping = (0, https_1.onRequest)(
  { cors: ['https://mcpcoop.org'], region: contracts_1.FUNCTION_CONFIG.REGION },
  (req, res) => {
    res.status(200).json({
      status: 'operational',
      service: 'unbogi-core',
      timestamp: Date.now(),
    });
  },
);
//# sourceMappingURL=index.js.map
