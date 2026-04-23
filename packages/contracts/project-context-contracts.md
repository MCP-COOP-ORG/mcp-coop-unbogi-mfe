# Context: @unbogi/contracts

> **AI Navigation** — Start here. This package is the **single source of truth** for all shared types,
> Zod schemas, constants, and error messages across the entire monorepo.
> No business logic. No runtime side-effects. Pure definitions.

## What This Package Is

A shared TypeScript library consumed by **both the backend (`@unbogi/firebase`) and the frontend (`@unbogi/shared`, TMA)**.
Changing anything here has **cross-package impact** — always check both consumers before editing.

Built with `tsup`, outputs ESM with `.js` extensions on all imports (required for Firebase Functions ESM compatibility).

## Structure

```
src/
├── index.ts            ← Single barrel: re-exports everything from constants + all domains
├── constants/          ← App-wide constants: collections, error codes/messages, config, email templates
└── domains/            ← Per-domain Zod schemas + TypeScript types (auth, contacts, gifts, holidays, invites)
```

## Sub-Contexts (follow links for details)

| Module | Context File |
|--------|-------------|
| Constants | [src/constants/project-context-constants.md](src/constants/project-context-constants.md) |
| Domains | [src/domains/project-context-domains.md](src/domains/project-context-domains.md) |

## Consumption Map

| Consumer | What it uses |
|----------|-------------|
| `@unbogi/firebase` (backend) | `COLLECTIONS`, `CONFIG`, `ERROR_MESSAGES`, `ERROR_CODES`, `FUNCTION_CONFIG`, `EMAILS`, `TELEGRAM_CONSTANTS`, `TG_MESSAGES`, `GIFT_ERROR_MESSAGES`, `LOGGING`, `FIREBASE_ERROR_CODES`, `FIREBASE_ERRORS`, `INVITE_PREFIX`, `INVITE_STATUS`, `SCRATCH_CODE_FORMAT`, all domain schemas/types |
| `@unbogi/shared` (frontend) | Domain types (`TelegramAuthResponse`, `Holiday`, `Contact`, `GiftResponse`, etc.), `COLLECTIONS`, `PROVIDERS`, `ERROR_CODES` |

## Key Design Rules

| Rule | Why |
|------|-----|
| No `zod` in backend service logic | Schemas live here; backend parses at handler boundary only |
| All Firestore collection names from `COLLECTIONS` | Never hardcode strings in repositories |
| All error messages from `ERROR_MESSAGES` / `GIFT_ERROR_MESSAGES` | Consistent client-visible errors; avoids string drift |
| `CONFIG` is the single source for timeouts/limits | `OTP_LIFETIME_MS`, `MAX_OTP_ATTEMPTS`, `INVITE_LIFETIME_MS` — change once, applies everywhere |
| Email templates defined here | Backend uses `EMAILS.TEMPLATE_OTP(code)` and `EMAILS.TEMPLATE_INVITE(...)` directly |

## External Dependencies

- `zod` — schema validation + TypeScript type inference (only dependency)
