# Context: domains/

> **Role** — Per-domain Zod schemas + derived TypeScript types.
> Schemas define the **exact wire contract** between client and Cloud Functions.
> Backend validates input at the handler boundary; types are shared with the frontend.
>
> ← [Back to package root](../../project-context-contracts.md)
> → Constants (error codes, config): [../constants/project-context-constants.md](../constants/project-context-constants.md)

## Pattern

```ts
export const XSchema = z.object({ ... });
export type XRequest = z.infer<typeof XSchema>;  // used on both client and server
```

All schemas are `z.object(...)`. No optional fields unless explicitly documented.

---

## `auth/index.ts` — Authentication Domain

### Request Schemas

| Schema | Type | Fields | Notes |
|--------|------|--------|-------|
| `TelegramAuthSchema` | `TelegramAuthRequest` | `initData: string (min 1)` | Raw Telegram `initData` string from TMA SDK |
| `SendOtpSchema` | `SendOtpRequest` | `email: string (email)`, `initData: string (min 1)` | `initData` required — server links OTP to Telegram identity |
| `VerifyOtpSchema` | `VerifyOtpRequest` | `email: string (email)`, `code: string (length 6)` | Exactly 6 chars; no `initData` needed (OTP record holds identity) |

### Response Schemas

| Schema | Type | Fields | Notes |
|--------|------|--------|-------|
| `TelegramAuthResponseSchema` | `TelegramAuthResponse` | `token?: string`, `hasEmail: boolean` | `token` absent if user has no email yet; client routes to OTP flow |
| `AuthResponseSchema` | `AuthResponse` | `token: string` | Custom Token for `signInWithCustomToken()`; returned by `verifyEmailOtp` |

**Auth flow summary:**
1. `telegramAuth(initData)` → `{ hasEmail: true, token }` or `{ hasEmail: false }` (no token)
2. If `hasEmail: false` → `sendEmailOtp({ email, initData })` → OTP delivered
3. `verifyEmailOtp({ email, code })` → `{ token }` → `signInWithCustomToken(token)`

---

## `contacts/index.ts` — Contacts Domain

| Schema | Type | Fields |
|--------|------|--------|
| `ContactSchema` | `Contact` | `id: string`, `displayName: string` |
| `ContactListResponseSchema` | `ContactListResponse` | `contacts: Contact[]` |

**Contacts** are users who have accepted mutual invites. `id` is the Firebase Auth UID of the contact.

---

## `gifts/index.ts` — Gifts Domain

### Request Schemas

| Schema | Type | Key Fields | Notes |
|--------|------|-----------|-------|
| `SendGiftSchema` | `SendGiftRequest` | `idempotencyKey`, `receiverId`, `holidayId`, `greeting (max 250)`, `unpackDate (ISO datetime)`, `scratchCode` | `idempotencyKey` is client-generated; prevents duplicate gifts on retry |
| `ScratchGiftSchema` | `ScratchGiftRequest` | `giftId: string` | Receiver calls this to open the gift |

### Nested Schema

| Schema | Type | Fields |
|--------|------|--------|
| `ScratchCodeSchema` | `ScratchCode` | `value: string`, `format: 'text' \| 'link' \| 'qr'` |

### Response Schema

| Schema | Type | Fields |
|--------|------|--------|
| `GiftResponseSchema` | `GiftResponse` | `giftId: string` |

**Business constraints** (enforced in `GiftService`, not in schema):
- No self-gifts (`senderId !== receiverId`)
- Receiver must be in sender's contacts
- `holidayId` must exist in `holidays` collection

---

## `holidays/index.ts` — Holidays Domain

| Schema | Type | Fields | Notes |
|--------|------|--------|-------|
| `HolidaySchema` | `Holiday` | `id`, `name`, `imageUrl`, `date?`, `defaultGreeting?` | `imageUrl` may be a Storage path resolved server-side |
| `HolidayListResponseSchema` | `HolidayListResponse` | `holidays: Holiday[]` | No auth required to fetch |

---

## `invites/index.ts` — Invites Domain

All schemas are **request-only** (responses use `AuthResponse` from auth domain or void).

| Schema | Type | Fields | Notes |
|--------|------|--------|-------|
| `CreateInviteSchema` | `CreateInvitePayload` | *(empty object)* | Auth UID taken from Firebase context |
| `AcceptInviteSchema` | `AcceptInvitePayload` | `token: string` | Telegram invite redemption |
| `SendEmailInviteSchema` | `SendEmailInvitePayload` | `targetEmail: string (email)` | Sends invite to the given email |
| `RedeemEmailInviteSchema` | `RedeemEmailInvitePayload` | `inviteToken: string`, `initData: string` | Email invite redemption with Telegram identity |

**Invite flows:**
- **Telegram flow:** `create()` → share link → `acceptInvite({ token })`
- **Email flow:** `sendEmailInvite({ targetEmail })` → email → `redeemEmailInvite({ inviteToken, initData })`
- Both flows result in mutual contact records + Custom Token for new user
