# Context: @unbogi/firebase

> **AI Navigation** — Start here. Jump to a sub-context for detailed file-level documentation.

## What This Package Is

Server-side Cloud Functions backend for the **UnBoGi** Telegram Mini App.
Deployed on Firebase (region: `europe-west1`), written in TypeScript, bundled by `tsup`.

Responsibilities:
- Authentication (Telegram HMAC + Email OTP → Firebase Custom Token)
- Gift send / scratch lifecycle
- Invite link creation, email dispatch, redemption
- Contact management (list connected users)
- Holiday catalog (read-only)
- Telegram push notifications via Bot API + Cloud Tasks

## Architecture

```
src/
├── index.ts              ← Deployment entry: admin.initializeApp() + setGlobalOptions() + handler re-exports + `ping` health-check
├── handlers/             ← Cloud Function composition roots (HTTP onCall / Firestore triggers)
├── repositories/         ← Firestore data-access layer (no business logic)
├── services/             ← Business logic (depend on repositories, never on admin.firestore() directly)
└── utils/                ← Shared utilities: error types, storage helpers, firebase-auth helper
```

**Strict layering rule:**
`handlers` → `services` → `repositories` → `admin.firestore()`
No layer may skip downward.

## Sub-Contexts (follow links for details)

| Layer | Context File |
|-------|-------------|
| Handlers | [src/handlers/project-context-handlers.md](src/handlers/project-context-handlers.md) |
| Repositories | [src/repositories/project-context-repositories.md](src/repositories/project-context-repositories.md) |
| Services | [src/services/project-context-services.md](src/services/project-context-services.md) |
| Utils | [src/utils/project-context-utils.md](src/utils/project-context-utils.md) |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dependency Injection via constructors | Testability; handlers are the composition root |
| Compensating write for OTP | Email sent first, DB write only on success — no orphaned OTP records |
| `AppError` for repository errors | Type-safe routing in services; avoids fragile string comparison |
| `enforceAppCheck: true` on public endpoints | Blocks unauthenticated bot/scraper calls at the Cloud Functions layer |
| Firestore Security Rules close all client paths | Admin SDK bypasses rules — client SDK has zero write surface |

## Secrets (firebase-functions/params)

| Secret | Used by |
|--------|---------|
| `TELEGRAM_BOT_TOKEN` | auth, invites, notifications handlers |
| `TELEGRAM_BOT_USERNAME` | invites, notifications handlers |
| `RESEND_API_KEY` | auth, invites handlers |

## External Dependencies

- `firebase-admin` — Firestore, Auth, Cloud Tasks
- `resend` — transactional email (OTP + invite emails)
- `@unbogi/contracts` — shared constants, schemas, error codes (source of truth)
- `firebase-functions/v2` — Cloud Function definitions
