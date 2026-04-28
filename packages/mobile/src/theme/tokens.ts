/**
 * UnBoGi — Neo-Brutalism Design Tokens (React Native)
 *
 * Ported from TMA's theme.css + style-constants.ts.
 * Single source of truth for all mobile UI styling.
 */

// ── Colors ──────────────────────────────────────────────────────────────────────
export const colors = {
  // Core palette
  ink: '#1A1A1A',
  cream: '#FFF5E1',
  warmBg: '#FAF6EE',
  white: '#FFFFFF',

  // Semantic
  text: '#2B2A2C',
  muted: '#A1A1AA',
  errorRed: '#EB2D2D',
  successGreen: '#7AB648',

  // Button / accent variants
  orange: '#F5A623',
  red: '#E05252',
  cyan: '#5AABDE',
  lime: '#7AB648',

  // Surface
  fieldBg: '#FAF6EE',
  fieldBorder: '#1A1A1A',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// ── Radii ───────────────────────────────────────────────────────────────────────
export const radii = {
  sm: 12,
  md: 20,
  lg: 26,
  full: 9999,
  field: 14,
  button: 28,
} as const;

// ── Sizing ──────────────────────────────────────────────────────────────────────
export const sizing = {
  buttonHeight: 42,
  fieldHeight: 42,
  bottomNavHeight: 64,
  screenPaddingH: 16,
} as const;

// ── Shadows (Neo-Brutalism) ─────────────────────────────────────────────────────
// RN shadow for iOS + elevation for Android
export const shadows = {
  button: {
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  subtle: {
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 3,
  },
} as const;

// ── Typography ──────────────────────────────────────────────────────────────────
// Font family will be set after loading custom fonts via expo-font
export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.ink,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.muted,
  },
  button: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
    textTransform: 'uppercase' as const,
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
