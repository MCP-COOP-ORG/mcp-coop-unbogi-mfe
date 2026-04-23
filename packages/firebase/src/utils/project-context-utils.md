# Context: utils/

> **Layer role** — Stateless shared utilities. No Firestore access, no business logic.
> Used across services and repositories.
>
> ← [Back to package root](../../project-context-firebase.md)
> → Services that use these: [../services/project-context-services.md](../services/project-context-services.md)
> → Repositories that use AppError: [../repositories/project-context-repositories.md](../repositories/project-context-repositories.md)

## Files

### `errors.ts` — `AppError`

Custom error class for typed domain errors within the repository layer.

```ts
class AppError extends Error {
  constructor(
    public readonly code: 'not-found' | 'permission-denied' | 'already-exists' | 'internal',
    message: string
  )
}
```

**Usage pattern:**
- Repositories throw `AppError` with a typed `code`
- Services catch `AppError` and map `code` → `HttpsError` (never string-compare `message`)

Also exports `errorToHttpsError(err)` — maps `AppError` to `HttpsError` for generic catch blocks.

---

### `firebase-auth.ts` — `getOrCreateFirebaseUser`

```ts
async function getOrCreateFirebaseUser(email: string): Promise<UserRecord>
```

Looks up a Firebase Auth user by email; creates one if not found.
Used by `AuthService.verifyEmailOtp` to ensure idempotent user creation.

---

### `storage.ts`

| Export | Description |
|--------|-------------|
| `resolveStorageUrl(path)` | Converts a Firebase Storage object path to a signed download URL |
| `mapTimestamp(ts)` | Converts Firestore `Timestamp` → ISO string for API responses |

Used by `HolidayService` and `GiftService` to resolve image URLs before returning to client.

---

### `index.ts`
Barrel: exports `AppError`, `errorToHttpsError`, `getOrCreateFirebaseUser`, `resolveStorageUrl`, `mapTimestamp`.
