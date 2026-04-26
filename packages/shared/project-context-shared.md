# Context: @unbogi/shared

> **AI Navigation** — Start here. Jump to a sub-context for detailed file-level documentation.

## What This Package Is

Frontend shared library for the **UnBoGi** Telegram Mini App.
Consumed exclusively by the `tma` package (Vite/React app).
Contains: Firebase client initialization, App Check setup, all domain API wrappers, Zustand stores, types, and UI-level constants.

**Not to be confused with `@unbogi/contracts`** — contracts holds wire schemas and server-side constants.
`@unbogi/shared` holds **client runtime** concerns: state, API calls, Firebase Auth, App Check.

## Structure

```
src/
├── index.ts              ← Single barrel: exports constants, domains, firebase singletons
├── constants/            ← Client-side constants: function names, auth statuses, UI config
├── firebase/             ← Firebase app init + App Check setup (client SDK)
├── domains/              ← Per-domain: api (httpsCallable), store (Zustand), types, validation
│   ├── auth/
│   ├── contacts/
│   ├── gifts/
│   ├── holidays/
│   └── invites/
└── env.d.ts              ← Vite env variable type declarations (UNBOGI_FIREBASE_*)
```

## Sub-Contexts (follow links for details)

| Module | Context File |
|--------|-------------|
| Constants | [src/constants/project-context-constants.md](src/constants/project-context-constants.md) |
| Firebase | [src/firebase/project-context-firebase-client.md](src/firebase/project-context-firebase-client.md) |
| Domains | [src/domains/project-context-domains.md](src/domains/project-context-domains.md) |

## Key Design Rules

| Rule | Why |
|------|-----|
| All Cloud Function calls via `CLOUD_FUNCTIONS` keys | Never hardcode function names; single source of truth in `constants/` |
| Zustand stores are the only mutable state | No React context, no Redux; stores are imported directly in components |
| `isLoaded` guard on all stores | Prevents duplicate loads on re-render; reset on signOut |
| `initialize()` returns Firebase `Unsubscribe` | Caller (TMA root) is responsible for cleanup on unmount |
| App Check active only in non-DEV | `import.meta.env.DEV` guard; emulator bypasses App Check automatically |
| `pendingEmail` + `otpSentAt` in AuthStore | Drives client-side OTP countdown timer without extra state |

## External Dependencies

- `firebase` (client SDK) — Auth, Functions, App Check
- `zustand` — lightweight state management
- `zod` — gift send form validation only
- `@unbogi/contracts` — `COLLECTIONS`, `PROVIDERS`, `ERROR_CODES` (types shared with backend)

## Related Packages

| Package | Context File |
|---------|-------------|
| TMA (consumer) | [../tma/project-context-tma.md](../tma/project-context-tma.md) |
| Contracts | [../contracts/project-context-contracts.md](../contracts/project-context-contracts.md) |
| Firebase (backend) | [../firebase/project-context-firebase.md](../firebase/project-context-firebase.md) |

