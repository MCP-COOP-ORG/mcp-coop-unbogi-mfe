/**
 * UnBoGi — Neo-Brutalism Design Tokens (React Native)
 *
 * Ported from TMA's theme.css + style-constants.ts.
 * Single source of truth for ALL mobile UI styling.
 *
 * ⚠️  Every visual value in the app MUST reference these tokens.
 *     Do NOT use hardcoded hex / rgba values in components.
 */

// ── Colors ──────────────────────────────────────────────────────────────────────
export const colors = {
  // ── Core palette ──
  ink: '#1A1A1A',
  cream: '#FFF5E1',
  warmBg: '#FAF6EE',
  white: '#FFFFFF',

  // ── Semantic text ──
  text: '#2B2A2C',
  muted: '#A1A1AA',
  placeholder: '#A1A1AA',
  errorRed: '#EB2D2D',
  errorBright: '#FF5A5A',
  successGreen: '#7AB648',
  successGreenBright: '#10B981',

  // ── Button / accent variants (actual values from Button.tsx) ──
  buttonOrange: '#FF8A00',
  buttonRed: '#EB2D2D',
  buttonCyan: '#00E5FF',
  buttonLime: '#7AB648',

  // ── Accent colors (design tokens from TMA) ──
  orange: '#F5A623',
  red: '#E05252',
  cyan: '#5AABDE',
  lime: '#7AB648',

  // ── Surface / field ──
  fieldBg: '#FAF6EE',
  fieldBorder: '#1A1A1A',

  // ── Modal / card ──
  modalTitle: '#4A3A35',
  modalSubtitle: 'rgba(74, 58, 53, 0.7)',
  formLabel: '#5D4037',

  // ── Date picker (iOS native) ──
  datePickerBg: '#FFFFFF',
  datePickerDivider: '#CCCCCC',
  datePickerAction: '#007AFF',

  // ── Overlays ──
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // ── Ink alpha scale (for text/borders at various opacities) ──
  inkAlpha80: 'rgba(26, 26, 26, 0.8)',
  inkAlpha75: 'rgba(26, 26, 26, 0.75)',
  inkAlpha60: 'rgba(26, 26, 26, 0.6)',
  inkAlpha50: 'rgba(26, 26, 26, 0.5)',
  inkAlpha45: 'rgba(26, 26, 26, 0.45)',
  inkAlpha40: 'rgba(26, 26, 26, 0.4)',

  // ── Border alpha scale ──
  borderLight: 'rgba(0, 0, 0, 0.1)',
  borderMedium: 'rgba(0, 0, 0, 0.3)',

  // ── Text with text-shadow (used in Button, EmptyState, LockOverlay) ──
  textShadowWhite: 'rgba(255, 255, 255, 0.8)',
  textMuted80: 'rgba(43, 42, 44, 0.8)',

  // ── Success field highlight ──
  successBgTint: 'rgba(122, 182, 72, 0.1)',
  successBorderTint: 'rgba(122, 182, 72, 0.3)',

  // ── Scratch canvas ──
  frostTint: 'rgba(250, 246, 238, 0.3)',

  // ── Tab navigation ──
  tabInactive: '#5AABDE',

  // ── Semantic aliases ──
  textBrown: '#4A3A35',
  danger: '#EB2D2D',
} as const;

// ── Radii ───────────────────────────────────────────────────────────────────────
export const radii = {
  sm: 12,
  md: 20,
  lg: 26,
  full: 9999,
  field: 14,
  pill: 24,
  button: 28,
  modal: 32,
} as const;

// ── Sizing ──────────────────────────────────────────────────────────────────────
export const sizing = {
  buttonHeight: 42,
  fieldHeight: 42,
  inputHeight: 48,
  textareaMinHeight: 120,
  textareaInputMinHeight: 88,
  emptyStateLogo: 172,
  bottomNavHeight: 64,
  screenPaddingH: 16,
  logoSize: 240,
} as const;

// ── Shadows (Neo-Brutalism) ─────────────────────────────────────────────────────
// RN shadow for iOS + elevation for Android
export const shadows = {
  button: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  subtle: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// ── Font Size Scale ─────────────────────────────────────────────────────────────
// All fontSize values actually used across the app, consolidated into a scale.
export const fontSizes = {
  micro: 10,
  xs: 11,
  sm: 12,
  caption: 13,
  base: 14,
  body: 15,
  md: 16,
  formLabel: 17,
  subheading: 18,
  title: 20,
  heading: 24,
} as const;

// ── Typography ──────────────────────────────────────────────────────────────────
// Font family will be set after loading custom fonts via expo-font.
// For now these tokens reflect actual fontSize/fontWeight combos used in the app.
export const typography = {
  heading: {
    fontSize: fontSizes.heading,
    fontWeight: '800' as const,
    color: colors.ink,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  subheading: {
    fontSize: fontSizes.subheading,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  body: {
    fontSize: fontSizes.body,
    fontWeight: '400' as const,
    color: colors.text,
  },
  bodyBold: {
    fontSize: fontSizes.body,
    fontWeight: '700' as const,
    color: colors.text,
  },
  input: {
    fontSize: fontSizes.md,
    fontWeight: '400' as const,
    color: colors.ink,
  },
  caption: {
    fontSize: fontSizes.caption,
    fontWeight: '500' as const,
    color: colors.muted,
  },
  small: {
    fontSize: fontSizes.sm,
    fontWeight: '400' as const,
    color: colors.muted,
  },
  micro: {
    fontSize: fontSizes.micro,
    fontWeight: '500' as const,
    color: colors.inkAlpha60,
  },
  button: {
    fontSize: fontSizes.body,
    fontWeight: '700' as const,
    color: colors.white,
    textTransform: 'uppercase' as const,
  },
  buttonLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  hint: {
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    color: colors.textMuted80,
  },
  formLabel: {
    fontSize: fontSizes.formLabel,
    fontWeight: '600' as const,
    color: colors.formLabel,
  },
  error: {
    fontSize: fontSizes.sm,
    fontWeight: '500' as const,
    color: colors.errorRed,
  },
} as const;

// ── Spacing ─────────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ── Icon defaults ───────────────────────────────────────────────────────────────
export const iconDefaults = {
  size: 24,
  smallSize: 20,
  strokeWidth: 2.5,
  heavyStrokeWidth: 3,
  color: colors.ink,
} as const;

// ── Scratch canvas constants ────────────────────────────────────────────────────
/** Diameter of the eraser brush in logical pixels */
export const SCRATCH_BRUSH_SIZE = 50;

/** Fraction of canvas that must be scratched to auto-reveal (0..1) */
export const SCRATCH_CLEAR_THRESHOLD = 0.6;

/** Minimum long-press duration before scratch gesture activates (ms) */
export const SCRATCH_HOLD_DELAY_MS = 150;

/** Gaussian blur radius applied to the scratch mask edge */
export const SCRATCH_BLUR_RADIUS = 8;
