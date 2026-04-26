/**
 * Neo-Brutalism design tokens.
 *
 * Single source of truth for all shadow/glow values used by form fields.
 * Import these instead of copy-pasting shadow strings.
 */

// ── Field ring shadows (Input / Select / Textarea) ─────────────────────────
export const FIELD_SHADOW = {
  normal: 'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFD1B3,0_0_0_4px_#1A1A1A]',
  normalFocus:
    'focus-within:shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFB870,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(255,184,112,0.4)]',
  error: 'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#EB2D2D,0_0_0_4px_#1A1A1A,0_2px_8px_rgba(235,45,45,0.25)]',
  errorFocus:
    'focus-within:shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#EB2D2D,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(235,45,45,0.55)]',
  disabled: '!shadow-[0_0_0_1px_#CCC,0_0_0_3px_#EEE,0_0_0_4px_#CCC]',
} as const;

/** Pre-joined shadow class string for normal state. */
export const FIELD_SHADOW_NORMAL = `${FIELD_SHADOW.normal} ${FIELD_SHADOW.normalFocus}`;

/** Pre-joined shadow class string for error state. */
export const FIELD_SHADOW_ERROR = `${FIELD_SHADOW.error} ${FIELD_SHADOW.errorFocus}`;

// ── Error text style (inline CSS) ──────────────────────────────────────────
export const ERROR_TEXT_SHADOW =
  '-0.5px -0.5px 0 #1A1A1A, 0.5px -0.5px 0 #1A1A1A, -0.5px 0.5px 0 #1A1A1A, 0.5px 0.5px 0 #1A1A1A, 0 1px 4px rgba(255,255,255,0.9)';

// ── Colors ─────────────────────────────────────────────────────────────────
export const COLORS = {
  ink: '#1A1A1A',
  error: '#EB2D2D',
  cream: '#FFF5E1',
  warmBg: '#FAF6EE',
  muted: '#A1A1AA',
  text: '#2b2a2c',
} as const;

// ── Dimensions ─────────────────────────────────────────────────────────────
export const FIELD_HEIGHT = 42;
export const FIELD_RADIUS = 14;
