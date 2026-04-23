# Context: services/

> **Layer role** — Business logic. Services receive repositories via constructor DI.
> They throw `HttpsError` (never raw errors). They never call `admin.firestore()` directly.
>
> ← [Back to package root](../../project-context-firebase.md)
> → Repositories (data-access): [../repositories/project-context-repositories.md](../repositories/project-context-repositories.md)
> → Handlers (composition root): [../handlers/project-context-handlers.md](../handlers/project-context-handlers.md)

## Pattern

```ts
class XService {
  constructor(private readonly xRepo: XRepository) {}
  // Methods throw HttpsError on failure, return typed data on success
}
```

## Files

### `auth.ts` — `AuthService`

**Domain:** Authentication — Telegram + Email OTP

**Dependencies:** `UserRepository`, `OtpRepository`

| Method | Business Logic |
|--------|---------------|
| `validateAndExtractUser(initData, botToken)` | HMAC-SHA256 validation of Telegram `initData`; extracts `TgUser`. Reused by invite flow. |
| `authenticateWithTelegram(payload, botToken)` | Looks up user by `telegramId`; issues Custom Token if found, else `{ hasEmail: false }` |
| `sendEmailOtp(payload, botToken, resendApiKey)` | Validates initData → checks active OTP (idempotent skip) → sends email via Resend → **writes OTP only after email confirmed** (compensating write) |
| `verifyEmailOtp(payload)` | Check order: attempts limit → expiry → code match → delete OTP → upsert user → issue Custom Token |

**Critical:** OTP check order matters — attempts checked first to prevent timing attacks. Exceeded or expired → record deleted immediately, user must request a new OTP.

---

### `gift.ts` — `GiftService`

**Domain:** Gift lifecycle (send + scratch)

**Dependencies:** `GiftRepository`, `ContactRepository`, `HolidayRepository`

| Method | Business Logic |
|--------|---------------|
| `sendGift(payload, senderId)` | No self-gifts → receiver must be a contact → holiday must exist → creates gift (idempotent via `idempotencyKey`) |
| `scratchGift(payload, callerId)` | Delegates to `GiftRepository.scratchGift`; maps `AppError` codes to `HttpsError` |

---

### `invite.ts` — `InviteService`

**Domain:** Invite links (Telegram + email)

**Dependencies:** `InviteRepository`, `UserRepository`, `AuthService`

| Method | Business Logic |
|--------|---------------|
| `createInvite(userId)` | Generates unique token → stores invite doc |
| `acceptInvite(inviteId, acceptorId)` | Marks invite used → creates mutual contact records |
| `sendEmailInvite(payload, senderId, botUsername, resendApiKey)` | Looks up sender → sends branded email invite |
| `redeemEmailInvite(payload, botToken)` | Validates initData via `AuthService.validateAndExtractUser` → validates invite token not expired/used → upserts user with `telegramId` + marks invite used → issues Custom Token (no OTP step) |

---

### `notification.ts` — `NotificationService`

**Domain:** Telegram push notifications

**Dependencies:** `UserRepository`

| Method | Business Logic |
|--------|---------------|
| `sendGiftReceivedTelegram(...)` | Sends "someone sent you a surprise" TG message |
| `sendGiftReadyTelegram(...)` | Sends "gift ready to open" TG message |
| `scheduleGiftReadyTask(...)` | Enqueues Cloud Task for future delivery at `unpackDate`; skips if date is past |
| `sendTelegramNotification(...)` *(private)* | Looks up `telegramId` via `UserRepository` → calls Telegram Bot API with inline keyboard |

Errors are **non-fatal** (logged, not thrown) — a failed TG notification must not break the gift flow.

---

### `contact.ts` — `ContactService`

**Domain:** Contact list

**Dependencies:** `ContactRepository`

| Method | Business Logic |
|--------|---------------|
| `listContacts(userId)` | Returns formatted contact list for the authenticated user |

---

### `holiday.ts` — `HolidayService`

**Domain:** Holiday catalog

**Dependencies:** `HolidayRepository`

| Method | Business Logic |
|--------|---------------|
| `listHolidays()` | Returns holidays with resolved Firebase Storage download URLs for images |

Uses `resolveStorageUrl` util to convert Storage paths → public download URLs.

---

### `index.ts`
Barrel: exports all service classes.
