# Context: lib/ & hooks/

> **Role** — Pure utilities (no React) and custom React hooks. No business logic — only infrastructure.
>
> ← [Back to package root](../../project-context-tma.md)
> → Telegram SDK types: `types/telegram-webapp.d.ts`
> → Consumed by: [../screens/project-context-screens.md](../screens/project-context-screens.md), [../ui/project-context-ui.md](../ui/project-context-ui.md)

---

## `lib/` — Pure Utilities

### `telegram.ts` — TG SDK Bridge

**Single entry point** for all Telegram WebApp SDK access. Exports `tg` singleton + `withHaptic` HOF.

| Export | Type | Purpose |
|--------|------|---------|
| `tg.initData` | `string` | Raw init data for backend HMAC validation |
| `tg.startParam` | `string?` | Deep-link invite token |
| `tg.user` | `TelegramUser \| null` | **Runtime-validated** via `isValidTelegramUser()` guard. Cached after first parse. |
| `tg.isTelegram` | `boolean` | True if running inside TG WebView |
| `tg.ready()` / `tg.expand()` | `void` | Lifecycle signals to TG SDK (defensively wrapped in try/catch) |
| `tg.haptic(style)` | `void` | Haptic impact feedback (light/medium/heavy) |
| `tg.hapticNotification(type)` | `void` | Notification haptic (success/error/warning) |
| `tg.showBackButton(onClick)` | `() => void` | Returns cleanup function (offClick + hide) |
| `tg.scanQr(promptText)` | `Promise<string \| null>` | Promisified QR scanner |
| `withHaptic(fn, level?)` | HOF | Wraps callback with `tg.haptic()` — eliminates boilerplate |

**Security:** `isValidTelegramUser()` checks `typeof id === 'number' && typeof first_name === 'string'` before trusting `initDataUnsafe.user`.

### `sanitize.ts` — XSS Mitigation

| Export | Purpose |
|--------|---------|
| `sanitizeImageUrl(url)` | Validates protocol is `https:` / `http:` / `data:`. Blocks `javascript:`, `vbscript:`, etc. |
| `isImageReady(url)` | Type guard `url is string` — checks non-empty + passes sanitization. Use before `<img>` rendering. |

### `format.ts` — Date Formatting

| Export | Purpose |
|--------|---------|
| `formatLocalDate(date, preset)` | Formats via `Intl.DateTimeFormat` with app locale. Presets: `short`, `full`, `numeric`. |

Replaces duplicated `toLocaleDateString()` calls across Postcard, LockOverlay, GiftBack.

### `i18n.ts` — Translations

Lightweight i18n — no external library. Single `en` translation object (`as const` for type safety).

| Namespace | Keys |
|-----------|------|
| `auth` | Login form labels, error messages |
| `send` | Gift form labels, validation messages |
| `collection` | Empty state text |
| `surprises` | Empty state, sender/date templates |
| `giftBack` | Activation code labels |
| `invite` | Invite modal labels |

Type: `Translations = typeof en`. Consumed via `useT()` hook.

### `assets.ts` — Static Asset Registry

Single registry for `BASE_URL`-prefixed asset paths. Currently: `LOGO`, `BIRD`.

---

## `hooks/` — Custom React Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useT()` | `use-t.ts` | Returns `Translations` object for current locale (falls back to `en`). Reads `tg.languageCode`. |
| `useTelegram()` | `use-telegram.ts` | Returns `{ isTelegram, userId, languageCode }` — convenience wrapper over `tg` bridge. |
| `useScratchGesture(opts)` | `use-scratch-gesture.ts` | Encapsulates touch-based scratch logic: 150ms hold activation, touch-move erasing, throttled transparency check (250ms), one-shot reveal callback. Returns `{ canvasRef, revealedRef }`. |

### `useScratchGesture` details

Options: `{ clearThreshold: number, isUnlocked: boolean, onReveal?: () => void }`

Gesture activation flow:
1. `touchstart` — records start position, sets 150ms timeout
2. If finger moves >10px before timeout → cancel (scroll intent)
3. After 150ms → enter scratch mode, begin canvas erasing
4. `touchmove` — draws `destination-out` strokes on canvas
5. Every 250ms: sample pixels (stride 64), calculate % transparent
6. If `% >= clearThreshold` → fire `onReveal()` once

---

## `types/`

### `telegram-webapp.d.ts`

Full TypeScript declarations for the Telegram WebApp SDK surface used by this app.
Declares `Window.Telegram.WebApp` globally — eliminates `(window as any).Telegram`.

Key types: `TelegramUser`, `TelegramWebApp`, `WebAppInitData`, `HapticFeedback`, `BackButton`, `HapticImpactStyle`.
