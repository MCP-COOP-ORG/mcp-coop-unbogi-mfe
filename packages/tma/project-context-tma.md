# Context: @unbogi/tma

> **AI Navigation** — Start here. Jump to a sub-context for detailed file-level documentation.

## What This Package Is

Telegram Mini App (TMA) frontend for **UnBoGi** — a gift-sending/receiving platform inside Telegram.
Built with **Vite + React + TypeScript**. Deployed as a single-page app served via Firebase Hosting.

The TMA renders inside Telegram's WebView. It interacts with the Telegram WebApp SDK for haptic feedback,
viewport control, QR scanning, and back-button management. All backend calls go through `@unbogi/shared`
domain stores/APIs (which call Firebase Cloud Functions via `httpsCallable`).

**Design system:** Neo-Brutalism — bold shadows, colored glow borders, cream/ink palette, `framer-motion` animations.

## Structure

```
src/
├── app/                  ← Entry point: main.tsx → providers.tsx → app.tsx
├── screens/              ← Top-level route components (Login, Main)
│   ├── login/            ← Email OTP auth flow
│   └── main/             ← Gift carousel + SendForm + InviteModal
│       └── components/
│           └── strategies/ ← GoF Strategy pattern for surprises vs collection modes
├── ui/                   ← Shared visual components (no business logic)
│   ├── elements/         ← Button, Input, Select, Textarea, FormField
│   ├── gift-front/       ← Postcard, LockOverlay, ScratchCanvas
│   ├── gift-back/        ← GiftBack (flip-side with activation code)
│   ├── nav/              ← BottomNav bar
│   └── utils/            ← FlipFlap, Slider, LoadingSpinner
├── hooks/                ← Custom hooks: useT, useTelegram, useScratchGesture
├── lib/                  ← Pure utilities: telegram bridge, sanitize, format, i18n, assets
├── store/                ← Zustand UI stores (navigation, gift-mode, invite-modal)
├── styles/               ← CSS (global, theme vars) + style-constants.ts
└── types/                ← Telegram WebApp SDK type declarations
```

## Sub-Contexts (follow links for details)

| Module | Context File |
|--------|-------------|
| Screens | [src/screens/project-context-screens.md](src/screens/project-context-screens.md) |
| UI Components | [src/ui/project-context-ui.md](src/ui/project-context-ui.md) |
| Lib & Hooks | [src/lib/project-context-lib.md](src/lib/project-context-lib.md) |
| Store & Styles | [src/store/project-context-store.md](src/store/project-context-store.md) |

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Zustand over React Context | Stores are imported directly — no provider tree, no re-render cascading |
| Strategy pattern for gift modes | `surprises` vs `collection` tabs share 90% of UI; strategy swaps the data slice, overlay, and date logic |
| `tg` bridge singleton | All Telegram SDK access funneled through `lib/telegram.ts` — mockable, defensively coded |
| Runtime validation for `initDataUnsafe` | Telegram's `user` payload is `any` at runtime; `isValidTelegramUser()` guard prevents crashes |
| CSS custom properties for brand tokens | `theme.css` defines `--color-*`; `style-constants.ts` maps JS references via `var(--color-*)` |
| Discriminated Union for `ButtonProps` | `TabButtonProps | NormalButtonProps` — prevents invalid prop combos at compile time |
| Gesture logic in `useScratchGesture` hook | Separates touch-event concern from canvas rendering in `ScratchCanvas` |

## External Dependencies

- `@unbogi/shared` — domain API/stores, Firebase client, constants
- `@unbogi/contracts` — type contracts (via shared)
- `react` / `react-dom` — UI runtime
- `framer-motion` — animations, layout transitions, `AnimatePresence`
- `lucide-react` — icon set
- `zustand` — lightweight state management (UI-only stores)
- `@anthropic-ai/sdk` — _not used_ (workspace-level only)

## Data Flow

```
Telegram WebApp SDK
       ↓ initData, initDataUnsafe
  lib/telegram.ts (tg bridge) ← validated via isValidTelegramUser
       ↓
  app.tsx → useAuthStore.initialize(initData, startParam)
       ↓
  @unbogi/shared stores ← httpsCallable → Firebase Cloud Functions
       ↓
  screens/ → ui/ components render from store state
```
