# Context: handlers/

> **Layer role** — Cloud Function composition roots. No business logic lives here.
> Each handler: validates input → instantiates dependencies → delegates to a service.
>
> ← [Back to package root](../../project-context-firebase.md)
> → Services: [../services/project-context-services.md](../services/project-context-services.md)

## Pattern

```
handler file = secrets declaration + singleton service instantiation + onCall/onRequest wrappers
```

All services are instantiated **once per cold-start** (module-level singletons).
Dependency injection is done here — handlers are the composition root.

## Files

### `auth.ts`
Exports `telegramAuth`, `sendEmailOtp`, `verifyEmailOtp`.

| Function | Trigger | App Check | Business |
|----------|---------|-----------|----------|
| `telegramAuth` | `onCall` | ✅ enforced | Validates Telegram initData HMAC → issues Custom Token or returns `{ hasEmail: false }` |
| `sendEmailOtp` | `onCall` | ✅ enforced | Validates initData → sends OTP email via Resend → writes OTP to Firestore (only on email success) |
| `verifyEmailOtp` | `onCall` | ❌ (no token yet) | Verifies code → upserts Firestore user → issues Custom Token |

Injects: `UserRepository`, `OtpRepository` → `AuthService`

---

### `invites.ts`
Exports `create`, `acceptInvite`, `sendEmailInvite`, `redeemEmailInvite`.

| Function | Trigger | App Check | Business |
|----------|---------|-----------|----------|
| `create` | `onCall` | ✅ enforced | Authenticated user creates a shareable invite link (token stored in `invites` collection) |
| `acceptInvite` | `onCall` | ❌ | Auth required; redeems a Telegram invite token → creates mutual contact records for both users |
| `sendEmailInvite` | `onCall` | ✅ enforced | Sends invite email to a contact's email address |
| `redeemEmailInvite` | `onCall` | ✅ enforced | Validates initData + invite token → registers user via OTP-less Telegram flow |

Injects: `InviteRepository`, `UserRepository`, `OtpRepository` → `InviteService`, `AuthService`

---

### `gifts.ts`
Exports `send`, `getReceived`, `getOpened`, `scratch`.

| Function | Business |
|----------|----------|
| `send` | Authenticated sender creates a gift for a contact; idempotent via `idempotencyKey` |
| `getReceived` | Returns unscratched gifts for the authenticated user |
| `getOpened` | Returns scratched gifts for the authenticated user |
| `scratch` | Receiver opens a gift (marks `scratchedAt`); only receiver may scratch |

Injects: `GiftRepository`, `ContactRepository`, `HolidayRepository` → `GiftService`

---

### `contacts.ts`
Exports `list`.

Returns the authenticated user's contact list (users who have accepted mutual invites).

Injects: `ContactRepository` → `ContactService`

---

### `holidays.ts`
Exports `list`.

Returns the public holiday catalog (read-only; no auth required).

Injects: `HolidayRepository` → `HolidayService`

---

### `notifications.ts`
Exports `onGiftCreated`, `onGiftReadyTask`.

| Function | Trigger | Business |
|----------|---------|----------|
| `onGiftCreated` | Firestore `onDocumentCreated` (`gifts/{giftId}`) | Sends immediate "surprise" TG notification + schedules Cloud Task for `unpackDate` |
| `onGiftReadyTask` | `onTaskDispatched` | Sends "gift ready to open" TG notification at scheduled time |

Injects: `UserRepository` → `NotificationService`

---

### `index.ts`
Barrel re-export of all handlers — consumed by `src/index.ts` which also exposes the `ping` health-check endpoint (`GET /ping → { status: 'operational' }`).
