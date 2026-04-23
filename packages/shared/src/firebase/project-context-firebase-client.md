# Context: firebase/ (client)

> **Role** — Firebase client SDK initialization. Single source of `app`, `auth`, `functions` singletons.
> App Check wired here for production.
>
> ← [Back to package root](../../project-context-shared.md)
> → Domains that import singletons: [../domains/project-context-domains.md](../domains/project-context-domains.md)

## File: `index.ts`

Exports three singletons consumed by all API layers and the auth store:

| Export | Type | Notes |
|--------|------|-------|
| `app` | `FirebaseApp` | Initialized once from `import.meta.env` vars |
| `auth` | `Auth` | Used for `signInWithCustomToken`, `onAuthStateChanged`, `signOut` |
| `functions` | `Functions` | Pointed to region `europe-west1`; used in all `httpsCallable()` calls |

## App Check

Activated via `initializeAppCheck` with `ReCaptchaV3Provider`.

```ts
if (!import.meta.env.DEV) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('<site-key>'),
    isTokenAutoRefreshEnabled: true,
  });
}
```

- **DEV guard:** emulator accepts unauthenticated calls; App Check is skipped to avoid config friction.
- **Site key is public** (analogous to a Google Maps API key — safe to commit).
- **Token auto-refresh:** Firebase SDK handles token rotation silently.
- Functions with `enforceAppCheck: true` on the backend will reject requests without a valid App Check token (i.e., non-TMA clients in production).

## Environment Variables (`env.d.ts`)

All declared as `string` on `ImportMetaEnv`:

| Variable | Purpose |
|----------|---------|
| `UNBOGI_FIREBASE_API_KEY` | Firebase project API key |
| `UNBOGI_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `UNBOGI_FIREBASE_PROJECT_ID` | Project ID |
| `UNBOGI_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `UNBOGI_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `UNBOGI_FIREBASE_APP_ID` | App ID |

Injected by Vite at build time via `.env.production` / CI secrets.
