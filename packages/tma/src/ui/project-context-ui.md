# Context: ui/

> **Role** — Shared visual components. Zero business logic. Receive data via props, emit events via callbacks.
>
> ← [Back to package root](../../project-context-tma.md)
> → Screens that consume these: [../screens/project-context-screens.md](../screens/project-context-screens.md)

## Design System

**Neo-Brutalism** — bold black outlines, colored glow shadows, cream/ink palette.

- Colors defined as CSS custom properties in `styles/theme.css` (`--color-ink`, `--color-cream`, etc.)
- JS color references via `styles/style-constants.ts` → `COLORS.INK = 'var(--color-ink)'`
- All interactive elements use `framer-motion` for spring-based press/tap animations

---

## `elements/` — Form & Button primitives

| Component | File | Props highlights |
|-----------|------|-----------------|
| `Button` | `button.tsx` | **Discriminated Union**: `TabButtonProps` (layoutId + isActive) or `NormalButtonProps` (layout + children). Variants: orange/red/cyan/lime/transparent. Status: idle/loading/disabled. |
| `Input` | `input.tsx` | Neo-Brutalism styled `<input>` with thick border + inset shadow |
| `Select` | `select.tsx` | Native `<select>` wrapper with custom styling |
| `Textarea` | `textarea.tsx` | Auto-growing textarea |
| `FormField` | `form-field.tsx` | Label + error wrapper for form elements |

### Button architecture (key details)

- `BUTTON_SIZE = 42` — single source of truth for circle/tab sizing
- Shadow stack: inner black (1px) → white ring (2px) → outer black (1px) → colored ambient glow
- `buttonTheme` record maps `ButtonVariant → { bg, normalShadow, pressedShadow }`
- `isTabMode()` type guard for runtime variant discrimination
- Tab mode: transparent hitbox + `motion.div` with `layoutId` slides between tabs

---

## `gift-front/` — Gift card front face

| Component | File | Purpose |
|-----------|------|---------|
| `Postcard` | `postcard.tsx` | Renders holiday image + date + greeting. Uses `formatLocalDate('short')` and `sanitizeImageUrl`. |
| `LockOverlay` | `lock-overlay.tsx` | Countdown timer overlay. Shows `HH:MM:SS` until `lockedUntil: Date`. Fades out 1s after unlock. Uses `isImageReady` guard. |
| `ScratchCanvas` | `scratch-canvas.tsx` | Canvas-based scratch-off mechanic. Renders blurred postcard + logo + fingerprint icon. Delegates gesture to `useScratchGesture` hook. |

### ScratchCanvas rendering pipeline

1. Draw blurred postcard (14px CSS filter blur + frost overlay)
2. Draw centered logo + "READY TO SCRATCH" text (when unlocked)
3. Draw fingerprint icon at bottom-left (60px, 45° rotated)
4. Set `destination-out` compositing for touch erasing
5. On `clearThreshold` reached → fade canvas opacity to 0 (1200ms transition)

---

## `gift-back/` — Gift card back face

| Component | File | Purpose |
|-----------|------|---------|
| `GiftBack` | `index.tsx` | Shows activation code (text or QR barcode), sender info, date. Tap-to-copy with haptic feedback (success/error). |

---

## `nav/` — Bottom navigation

| Component | File | Purpose |
|-----------|------|---------|
| `BottomNav` | `index.tsx` | 4-tab bar: Surprises, Collection, Send, Invite. Uses `Button` in tab mode with shared `layoutId` for animated sliding background. All handlers wrapped with `withHaptic`. |

---

## `utils/` — Animation utilities

| Component | File | Purpose |
|-----------|------|---------|
| `FlipFlap` | `flip-flap.tsx` | 3D card flip animation (front ↔ back). Uses `rotateY` transform with `backfaceVisibility: hidden`. |
| `Slider` | `slider.tsx` | Horizontal swipeable container for gift carousel. Drag + snap with framer-motion. |
| `LoadingSpinner` | `spinner.tsx` | SVG spinner with configurable size/color. |
