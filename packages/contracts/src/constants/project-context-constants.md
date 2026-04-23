# Context: constants/

> **Role** — App-wide constants. All `as const` — no runtime mutation, fully type-safe.
> Zero logic. If you need to compute something, it belongs in a service, not here.
>
> ← [Back to package root](../../project-context-contracts.md)
> → Domain schemas: [../domains/project-context-domains.md](../domains/project-context-domains.md)

## File: `index.ts`

All constants live in a single file and are re-exported from the package root.

---

### `COLLECTIONS`

Firestore collection name map. **Always use this** — never hardcode strings in repositories.

| Key | Firestore Collection | Notes |
|-----|---------------------|-------|
| `USERS` | `users` | Keyed by Firebase Auth UID |
| `SYSTEM_OTP` | `system_otp` | Keyed by email; denied to client SDK via security rules |
| `INVITES` | `invites` | Invite tokens |
| `CONTACTS` | `contacts` | Per-user contact list |
| `HOLIDAYS` | `holidays` | Read-only holiday catalog |
| `GIFTS` | `gifts` | Gift documents |

---

### `CONFIG`

Runtime limits and cryptographic constants.

| Key | Value | Purpose |
|-----|-------|---------|
| `OTP_LIFETIME_MS` | 10 min | OTP validity window checked in `AuthService.verifyEmailOtp` |
| `INVITE_LIFETIME_MS` | 48 hours | Invite link validity window |
| `MAX_OTP_ATTEMPTS` | 5 | Failed attempts before OTP record deleted |
| `TG_HMAC_CONSTANT` | `'WebAppData'` | HMAC key prefix for Telegram `initData` validation |

---

### `ERROR_MESSAGES`

Human-readable error strings thrown as `HttpsError.message` by backend services.
Used for both client display and server logging.

| Key | Message | When thrown |
|-----|---------|------------|
| `INVALID_PAYLOAD` | `'Invalid payload'` | Zod parse failure at handler |
| `INVALID_TG_SIGNATURE` | `'Invalid Telegram signature'` | HMAC mismatch in `AuthService.validateAndExtractUser` |
| `TG_USER_NOT_FOUND` | `'User data not found in initData'` | `user` field missing from Telegram initData |
| `INVALID_EMAIL_FORMAT` | `'Invalid email format'` | Email regex fails |
| `FAILED_TO_SEND_EMAIL` | `'Failed to send email'` | Resend API returns error |
| `NO_PENDING_OTP` | `'No pending OTP for this email'` | `verifyEmailOtp` called with no active OTP record |
| `INVALID_OTP` | `'Invalid OTP code'` | Code does not match stored hash |
| `EXPIRED_OTP` | `'OTP has expired'` | `Date.now() > otp.expiresAt` |
| `OTP_ATTEMPTS_EXCEEDED` | `'Too many failed attempts...'` | `attempts >= MAX_OTP_ATTEMPTS` |
| `INVITE_EXPIRED` | `'This invite link has expired.'` | `Date.now() > invite.expiresAt` |
| `INVITE_ALREADY_USED` | `'This invite link has already been used.'` | `invite.usedAt` is set |

---

### `ERROR_CODES`

Firebase `HttpsError` code strings. Used when constructing `new HttpsError(ERROR_CODES.X, message)`.

| Key | Value |
|-----|-------|
| `INVALID_ARGUMENT` | `'invalid-argument'` |
| `UNAUTHENTICATED` | `'unauthenticated'` |
| `PERMISSION_DENIED` | `'permission-denied'` |
| `NOT_FOUND` | `'not-found'` |
| `INTERNAL` | `'internal'` |

---

### `GIFT_ERROR_MESSAGES`

Error messages specific to the gift domain (thrown by `GiftService` / `GiftRepository`).

| Key | When |
|-----|------|
| `RECEIVER_NOT_IN_CONTACTS` | Sender tries to gift a non-contact |
| `HOLIDAY_NOT_FOUND` | `holidayId` does not exist in `holidays` collection |
| `GIFT_NOT_FOUND` | `giftId` does not exist |
| `GIFT_ACCESS_DENIED` | Caller is not the receiver |
| `DUPLICATE_GIFT` | `idempotencyKey` collision |
| `SELF_GIFT_FORBIDDEN` | `senderId === receiverId` |
| `SELF_INVITE_FORBIDDEN` | User accepts their own invite |

---

### `EMAILS`

Email content configuration used by `AuthService` and `InviteService`.

| Key | Content |
|-----|---------|
| `SENDER` | `'UnBoGi Auth <auth@mcpcoop.org>'` |
| `SUBJECT_OTP` | OTP email subject |
| `TEMPLATE_OTP(code)` | HTML body generator for OTP email |
| `SUBJECT_INVITE` | Invite email subject |
| `TEMPLATE_INVITE(senderName, botUsername, token)` | HTML body generator — builds deep-link `https://t.me/{botUsername}/unbogi?startapp={token}` |

---

### `TELEGRAM_CONSTANTS`

Telegram initData parsing constants.

| Key | Value | Purpose |
|-----|-------|---------|
| `HASH_PARAM` | `'hash'` | Field to extract + remove before HMAC |
| `USER_PARAM` | `'user'` | Field containing serialized user JSON |
| `ALGO` | `'sha256'` | HMAC algorithm |
| `UID_PREFIX` | `'tg_'` | Prefix for Firestore user documents keyed by telegramId |
| `DEFAULT_NICKNAME` | `'User'` | Fallback when `first_name` absent |

---

### Other Constants

| Constant | Value / Purpose |
|----------|----------------|
| `PROVIDERS` | `telegram / email / google` — Auth provider identifiers |
| `FUNCTION_CONFIG` | `region: 'europe-west1'`, `memory: '256MiB'`, `timeout: 60s` — applied globally via `setGlobalOptions()` |
| `INVITE_PREFIX` | `'inv_'` — prefix for generated invite token IDs |
| `INVITE_STATUS` | `pending / accepted` |
| `SCRATCH_CODE_FORMAT` | `text / link / qr` — gift scratch code delivery format |
| `TG_MESSAGES` | Telegram Bot notification message strings (MarkdownV2 escaped) |
| `FIREBASE_ERRORS` | `USER_NOT_FOUND: 'auth/user-not-found'` — used in `getOrCreateFirebaseUser` |
| `FIREBASE_ERROR_CODES` | `ALREADY_EXISTS: 6` — Firestore gRPC error code for duplicate document |
| `TELEGRAM_BOT_API_URL` | `'https://api.telegram.org/bot'` — base URL; append `{token}/methodName` |
| `FALLBACK_NAMES` | `UNKNOWN: 'Unknown'` — display name fallback |
| `LOGGING` | `RESEND_ERROR: 'Resend API Error:'` — log prefix |
