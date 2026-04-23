# Context: constants/

> **Role** — Client-side constants. UI config, auth state machine values, Cloud Function name map.
> All `as const`. No logic, no imports from firebase.
>
> ← [Back to package root](../../project-context-shared.md)
> → Domains that consume these: [../domains/project-context-domains.md](../domains/project-context-domains.md)

## File: `index.ts`

---

### `CLOUD_FUNCTIONS`

Maps semantic keys → deployed Cloud Function names. **Always use this** in `httpsCallable()` calls — never hardcode strings.

| Key | Function Name | Domain |
|-----|--------------|--------|
| `AUTH_TELEGRAM` | `auth-telegramAuth` | Auth |
| `AUTH_SEND_EMAIL_OTP` | `auth-sendEmailOtp` | Auth |
| `AUTH_VERIFY_EMAIL_OTP` | `auth-verifyEmailOtp` | Auth |
| `HOLIDAYS_LIST` | `holidays-list` | Holidays |
| `INVITES_CREATE` | `invites-create` | Invites |
| `INVITES_ACCEPT` | `invites-accept` | Invites |
| `INVITES_SEND_EMAIL` | `invites-sendEmailInvite` | Invites |
| `INVITES_REDEEM_EMAIL` | `invites-redeemEmailInvite` | Invites |
| `CONTACTS_LIST` | `contacts-list` | Contacts |
| `GIFTS_SEND` | `gifts-send` | Gifts |
| `GIFTS_GET_RECEIVED` | `gifts-getReceived` | Gifts |
| `GIFTS_GET_OPENED` | `gifts-getOpened` | Gifts |
| `GIFTS_SCRATCH` | `gifts-scratch` | Gifts |

---

### `AUTH_STATUS` + `AuthStatus`

Auth state machine values used in `useAuthStore`.

| Value | Meaning |
|-------|---------|
| `idle` | Store not yet initialized |
| `loading` | `initialize()` called, awaiting backend response |
| `authenticated` | Firebase Auth session active, user object populated |
| `unauthenticated` | No session; login screen shown |
| `email_required` | Telegram auth passed but no email linked; OTP form shown |

`AuthStatus` type = `typeof AUTH_STATUS[keyof typeof AUTH_STATUS]` — exhaustive union.

---

### `OTP_CONFIG`

| Key | Value | Notes |
|-----|-------|-------|
| `LIFETIME_MS` | 10 min | Client countdown timer duration. Mirrors `CONFIG.OTP_LIFETIME_MS` from `@unbogi/contracts`. **Both must stay in sync.** |

---

### `GIFT_CONFIG`

UI constraints for the gift send form.

| Key | Value | Purpose |
|-----|-------|---------|
| `GREETING_MAX_LENGTH` | 250 | Enforced by `sendFormSchema` validation |
| `CODE_MIN_LENGTH` | 4 | Scratch code minimum length |
| `CODE_MAX_LENGTH` | 30 | Scratch code maximum length |
| `CONTACT_SEARCH_MIN_CHARS` | 2 | Minimum chars before contact search triggers |
| `CONTACT_SEARCH_MAX_RESULTS` | 5 | Max results in contact dropdown |
| `CONTACT_DROPDOWN_VISIBLE_ROWS` | 5 | Rows visible before scroll |
