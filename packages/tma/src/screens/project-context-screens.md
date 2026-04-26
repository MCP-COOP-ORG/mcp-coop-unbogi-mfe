# Context: screens/

> **Role** — Top-level route components. App renders either `LoginScreen` or `MainScreen` based on `AUTH_STATUS`.
>
> ← [Back to package root](../../project-context-tma.md)
> → UI components: [../ui/project-context-ui.md](../ui/project-context-ui.md)
> → Stores: [../store/project-context-store.md](../store/project-context-store.md)

## Routing Model

No router library. Navigation is driven by Zustand stores:

```
app.tsx
├── status === AUTHENTICATED → MainScreen
└── else                     → LoginScreen
```

Inside `MainScreen`, screen switching is handled by `useNavigationStore`:

```
MainScreen
├── SCREENS.MAIN → GiftCarousel + BottomNav + InviteModal
└── SCREENS.SEND → SendForm (full-screen animated overlay)
```

---

## `login/`

### `index.tsx` — `LoginScreen`

Multi-step auth flow: email input → OTP verification. Driven by `useAuthForm` hook.

**Steps:** `email` → `otp` (animated with `AnimatePresence`).

| Component | File | Purpose |
|-----------|------|---------|
| `LoginScreen` | `index.tsx` | Root layout, form steps, branding |
| `OtpTimer` | `components/otp-timer.tsx` | Countdown timer for OTP expiry (90s) |
| `useAuthForm` | `components/use-auth-form.ts` | Form state machine: manages email/OTP steps, validation, API calls, error handling |

### `useAuthForm` hook (critical logic)

State machine with guards:
- Validates email format before `sendEmailOtp`
- Validates 6-digit code before `verifyEmailOtp`
- `isSubmitting` guard prevents double-submit
- Uses `useAuthStore.setPendingOtp()` to persist OTP state

---

## `main/`

### `index.tsx` — `MainScreen`

Shell that composes: `GiftCarousel` + `BottomNav` + `InviteModal` + `SendForm` (overlay).

- On mount: loads `holidays`, `contacts`, `gifts` in parallel via respective shared stores
- `SendForm` rendered with `AnimatePresence` — slides up/down
- Telegram `BackButton` integration: pressing back from Send → returns to Main

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `GiftCarousel` | `gift-carousel.tsx` | Swipeable card stack using `ui/utils/Slider` |
| `GiftCardItem` | `gift-card-item.tsx` | Single card: Postcard front + GiftBack + FlipFlap animation |
| `SendForm` | `send-form.tsx` | Full gift creation form: friend picker, holiday, greeting, code, date |
| `SendFormModel` | `send-form-model.ts` | Zod form logic adapter between UI and `@unbogi/shared` validation |
| `InviteModal` | `invite-modal.tsx` | Email invite overlay with send flow |

### `strategies/` — Gift Screen Strategy (GoF)

Encapsulates the differences between **Surprises** and **Collection** tabs.

```ts
interface GiftScreenStrategy {
  mode: 'surprises' | 'collection';
  requiresTimer: boolean;
  selectGifts(store): GiftRecord[];
  selectDate(gift): Date;
  emptyLabel(t): string;
  renderOverlays(gift, ctx): ReactNode;
  renderImageOverlay?(gift, ctx): ReactNode;
}
```

| Strategy | Data slice | Date | Overlays |
|----------|-----------|------|----------|
| `surprisesStrategy` | `receivedGifts` | `unpackDate` | LockOverlay (countdown) + ScratchCanvas |
| `collectionStrategy` | `openedGifts` | `scratchedAt` | None |

Active strategy stored in `useGiftModeStore` — persists across Send navigation.
