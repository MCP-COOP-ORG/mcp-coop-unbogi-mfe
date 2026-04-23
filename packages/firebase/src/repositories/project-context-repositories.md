# Context: repositories/

> **Layer role** — Pure Firestore data-access. No business logic, no HTTP errors.
> Repositories throw `AppError` (typed) for domain violations; raw Firestore errors bubble up as-is.
>
> ← [Back to package root](../../project-context-firebase.md)
> → Services consume these: [../services/project-context-services.md](../services/project-context-services.md)
> → Utils (AppError): [../utils/project-context-utils.md](../utils/project-context-utils.md)

## Pattern

```ts
class XRepository {
  private get collection() { return admin.firestore().collection(COLLECTIONS.X); }
  // CRUD methods only — no validation, no HttpsError
}
```

All collections are defined in `@unbogi/contracts` → `COLLECTIONS` constant.

## Files

### `otp.ts` — `OtpRepository`
Collection: `system_otp` (keyed by email address)

| Method | Description |
|--------|-------------|
| `getOtp(email)` | Returns `OtpData \| null` |
| `setOtp(email, data)` | Full overwrite (not merge) — called after email confirmed; resets attempts counter on resend |
| `incrementAttempts(email)` | Atomically increments failed attempt counter via `FieldValue.increment` |
| `deleteOtp(email)` | Removes record after successful verify or max attempts exceeded |

**Security:** `system_otp` is denied to all clients in `firestore.rules` — Admin SDK only.

---

### `user.ts` — `UserRepository`
Collection: `users` (keyed by Firebase Auth UID)

| Method | Description |
|--------|-------------|
| `findByTelegramId(id)` | Query by `telegramId` field, limit 1 |
| `findById(uid)` | Direct doc lookup |
| `upsertUser(uid, data)` | `set` with `merge: true`; `createdAt` set via `serverTimestamp()` |

---

### `gift.ts` — `GiftRepository`
Collection: `gifts`

| Method | Description |
|--------|-------------|
| `createGift(idempotencyKey, data)` | `create()` — returns `false` on duplicate key (idempotent) |
| `getGift(giftId)` | Raw snapshot |
| `scratchGift(giftId, callerId)` | Transaction: checks existence → ownership → idempotency → updates `scratchedAt` |
| `getReceivedGifts(userId)` | Unscratched gifts for receiver, newest first, limit 50 |
| `getOpenedGifts(userId)` | Scratched gifts for receiver, newest first, limit 50 |

`scratchGift` throws `AppError('not-found')` or `AppError('permission-denied')`.

---

### `invite.ts` — `InviteRepository`
Collection: `invites`

| Method | Description |
|--------|-------------|
| `createInvite(inviteId, data)` | Creates invite document |
| `getInvite(inviteId)` | Lookup by token |
| `markInviteUsed(inviteId, usedBy)` | Sets `usedAt` + `usedBy` |

---

### `contact.ts` — `ContactRepository`
Collection: `contacts`

| Method | Description |
|--------|-------------|
| `listContacts(userId)` | Returns all contact docs where `ownerId == userId` |
| `areUsersConnected(a, b)` | Checks mutual contact existence |
| `addContact(ownerId, contactId)` | Creates contact document |

---

### `holiday.ts` — `HolidayRepository`
Collection: `holidays`

| Method | Description |
|--------|-------------|
| `listHolidays()` | Returns all holiday documents |
| `getHoliday(holidayId)` | Single doc lookup |

---

### `index.ts`
Barrel: exports all repository classes + key types (`OtpData`, `UserData`).
