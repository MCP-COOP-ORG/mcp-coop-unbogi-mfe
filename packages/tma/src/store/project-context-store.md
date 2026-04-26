# Context: store/ & styles/

> **Role** — UI-only Zustand stores for navigation/modal state + design system tokens.
>
> ← [Back to package root](../../project-context-tma.md)
> → Domain stores (auth, gifts, etc.) live in `@unbogi/shared` — see [shared context](../../../shared/project-context-shared.md)

**Important distinction:** This package has two layers of stores:
1. **Domain stores** (`@unbogi/shared`) — auth, gifts, holidays, contacts, invites. Manage server data.
2. **UI stores** (`store/`) — navigation, gift-mode tab, invite modal. Manage visual state only.

---

## `store/` — UI State

### `navigation.store.ts` — `useNavigationStore`

Controls which screen is visible inside `MainScreen`.

```ts
const SCREENS = { MAIN: 'main', SEND: 'send' } as const;
type ScreenId = 'main' | 'send';

interface NavigationState {
  activeScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
}
```

Used by: `MainScreen` (reads), `BottomNav` + `SendForm` (writes).

### `gift-mode.store.ts` — `useGiftModeStore`

Stores which gift-screen strategy (surprises / collection) is active.

```ts
interface GiftModeState {
  strategy: GiftScreenStrategy;
  setStrategy: (strategy: GiftScreenStrategy) => void;
}
```

**Decoupled from navigation** — switching to SendForm and back preserves the last selected tab without remounting GiftCarousel.

Default: `surprisesStrategy`.

### `invite-modal.store.ts` — `useInviteModalStore`

Simple boolean toggle for the invite modal overlay.

```ts
interface InviteModalState {
  isInviteModalOpen: boolean;
  openInviteModal: () => void;
  closeInviteModal: () => void;
}
```

---

## `styles/` — Design System

### `theme.css` — CSS Custom Properties

Defines the Neo-Brutalism color palette as CSS variables on `:root`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-ink` | `#2B2A2C` | Primary text, borders |
| `--color-cream` | `#FAF6EE` | Card backgrounds, frost overlay |
| `--color-success-green` | `#7AB648` | Success states, lime buttons |
| `--color-brand-orange` | `#F5A623` | Primary CTA, orange buttons |
| `--color-brand-cyan` | `#5AABDE` | Secondary accent, inactive tab icons |
| `--color-error-red` | `#E05252` | Error states, red buttons |

Also includes: spacing tokens, border-radius, font stacks.

### `global.css` — Base Styles

Tailwind directives (`@tailwind base/components/utilities`) + base resets.
Sets `font-family`, `-webkit-tap-highlight-color: transparent`, scroll behavior.

### `style-constants.ts` — JS Bridge to CSS Variables

Maps CSS custom properties to a `COLORS` object for use in JS/Canvas contexts:

```ts
export const COLORS = {
  INK: 'var(--color-ink)',
  CREAM: 'var(--color-cream)',
  SUCCESS_GREEN: 'var(--color-success-green)',
  // ...
} as const;
```

Also exports: `CARD_SIZE`, `CARD_BORDER_RADIUS`, `CARD_SHADOW` — used by Postcard and GiftCardItem.

**Rule:** Never hardcode hex values in components. Always reference `COLORS.*` or CSS `var(--color-*)`.
