# Context: domains/

> **Role** — Per-domain client modules. Each domain has 4 layers: `api`, `store`, `types`, `validation` (gifts only).
> This is the primary interface between TMA components and Cloud Functions.
>
> ← [Back to package root](../../project-context-shared.md)
> → Constants (function names, statuses): [../constants/project-context-constants.md](../constants/project-context-constants.md)
> → Firebase singletons: [../firebase/project-context-firebase-client.md](../firebase/project-context-firebase-client.md)

## Domain File Pattern

```
domains/<name>/
├── api.ts         ← httpsCallable wrappers; pure async functions; no state
├── store.ts       ← Zustand store; owns loading state, caching, reset
├── types.ts       ← TypeScript interfaces (client-side shape, may differ slightly from contracts)
├── validation.ts  ← Zod schema for form validation (gifts only)
└── index.ts       ← Barrel export
```

**Strict rule:** Components import from the domain barrel (`@unbogi/shared`), never from internal files directly.

---

## `auth/`

### `api.ts` — `authApi`

| Method | Cloud Function | What it does |
|--------|---------------|-------------|
| `authenticateTelegram(initData)` | `auth-telegramAuth` | Validates HMAC → if user found: `signInWithCustomToken` internally, returns `{ hasEmail: true }`. If not found: `{ hasEmail: false }`, no Firebase session created. |
| `sendEmailOtp(email, initData)` | `auth-sendEmailOtp` | Sends OTP. `initData` required — backend links OTP to Telegram identity. Idempotent: server skips if active OTP exists. |
| `verifyEmailOtp(email, code)` | `auth-verifyEmailOtp` | Verifies code → server returns Custom Token → `signInWithCustomToken` called internally. |

### `store.ts` — `useAuthStore`

State machine powered by `AUTH_STATUS`. Core method: `initialize(initData, startParam?)`.

**`initialize` logic (critical — read before modifying):**
1. Sets `status = loading`
2. If `startParam` present → attempt `invitesApi.redeemEmailInvite(startParam, initData)` first (deep-link invite flow) → `signInWithCustomToken` → `authenticated`. On failure: falls back to normal auth.
3. Normal auth: `authApi.authenticateTelegram(initData)` → `authenticated` or `email_required`
4. `onAuthStateChanged` listener runs in parallel **but ignores cached Firebase user until `isTelegramAuthResolved = true`** — prevents flicker from stale Firebase Auth cache.

| State field | Type | Purpose |
|-------------|------|---------|
| `user` | `User \| null` | Firebase Auth user object |
| `status` | `AuthStatus` | Drives UI routing (loading / email_required / authenticated / etc.) |
| `pendingEmail` | `string \| null` | Set after `sendEmailOtp`; used for OTP form display and deduplication |
| `otpSentAt` | `number \| null` | Unix ms timestamp of OTP dispatch; drives client countdown timer |

| Action | Description |
|--------|-------------|
| `initialize(initData, startParam?)` | Returns Firebase `Unsubscribe` — must be called in TMA root effect |
| `setPendingOtp(email, sentAt)` | Called after successful `sendEmailOtp` |
| `clearPendingOtp()` | Called after successful `verifyEmailOtp` |
| `signOut()` | Calls `auth.signOut()`, resets all state |

### `types.ts` — `AuthState`

Full Zustand store interface. `initialize` returns `Unsubscribe` — caller must invoke on unmount.

---

## `contacts/`

### `api.ts` — `contactsApi`

| Method | Function | Returns |
|--------|----------|---------|
| `list()` | `contacts-list` | `Contact[]` |

### `store.ts` — `useContactsStore`

| State | Purpose |
|-------|---------|
| `contacts: Contact[]` | Loaded contact list |
| `isLoading / isLoaded` | Prevents duplicate loads; `isLoaded` guard skips re-fetch |

**Pattern:** `loadContacts()` is a no-op if `isLoading || isLoaded`. Call once on mount.

### `types.ts` — `Contact`

```ts
{ id: string; displayName: string; telegramId?: number }
```
`id` = Firebase Auth UID of the contact. `telegramId` optional (not always returned by backend).

---

## `gifts/`

### `api.ts` — `giftsApi`

| Method | Function | Notes |
|--------|----------|-------|
| `getReceived()` | `gifts-getReceived` | Returns unscratched gifts |
| `getOpened()` | `gifts-getOpened` | Returns scratched gifts |
| `send(payload)` | `gifts-send` | Idempotent via `idempotencyKey` |
| `scratch(giftId)` | `gifts-scratch` | Receiver opens gift; only receiver may call |

### `store.ts` — `useGiftsStore`

`loadGifts()` fetches `getReceived` + `getOpened` in parallel via `Promise.all`.
Received gifts sorted client-side by `createdAt` descending.

| Action | Notes |
|--------|-------|
| `loadGifts()` | No-op if `isLoading`. Re-fetches if called again after `reset()` |
| `sendGift(payload)` | Delegates to `giftsApi.send`; does not update local state (caller should call `loadGifts` after) |
| `scratchGift(giftId)` | Error is caught+logged; non-fatal to allow optimistic UI patterns |
| `reset()` | Clears all state; called on `signOut` |

### `types.ts` — `GiftRecord` / `SendGiftPayload`

```ts
GiftRecord { id, senderId, senderName, receiverId, holidayId, imageUrl, greeting,
             unpackDate, scratchCode, scratchedAt: string | null, createdAt }
SendGiftPayload { idempotencyKey, receiverId, holidayId, greeting, unpackDate, scratchCode }
```

### `validation.ts` — `sendFormSchema` / `SendFormData`

Zod schema for the gift send form. Driven by `GIFT_CONFIG` constants.
Uses `z.discriminatedUnion` on `payload.type` (`'text'` | `'qr'`) — `'link'` format not yet in UI.

---

## `holidays/`

### `api.ts` — `holidaysApi`

| Method | Function | Notes |
|--------|----------|-------|
| `list()` | `holidays-list` | No auth required; `imageUrl` is a resolved Firebase Storage download URL |

### `store.ts` — `useHolidaysStore`

Standard `isLoading / isLoaded` guard. `loadHolidays()` is a no-op after first successful fetch.

### `types.ts` — `Holiday`

```ts
{ id: string; name: string; imageUrl?: string; defaultGreeting?: string }
```

---

## `invites/`

### `api.ts` — `invitesApi`

| Method | Function | Notes |
|--------|----------|-------|
| `sendEmailInvite(targetEmail)` | `invites-sendEmailInvite` | Returns void; fire-and-forget from UI perspective |
| `redeemEmailInvite(inviteToken, initData)` | `invites-redeemEmailInvite` | Returns `{ token }` → caller does `signInWithCustomToken`. Called by `AuthStore.initialize` on deep-link startup. |

**No store** — invites have no cached state on the client. All invite state is server-side.
