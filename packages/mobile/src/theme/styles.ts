/**
 * UnBoGi — Composite Styles (React Native)
 *
 * Pre-built style objects for Neo-Brutalism patterns that repeat
 * across multiple components (card, field, modal, etc.).
 * Built entirely from tokens — never hardcode values here.
 */

import { StyleSheet } from 'react-native';
import { colors, radii, shadows, sizing } from './tokens';

/** Reusable Neo-Brutalism style presets */
export const neoBrut = StyleSheet.create({
  // ── Card ──
  card: {
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.md,
    ...shadows.card,
  },

  // ── Field (Input / Textarea / Dropdown) ──
  field: {
    borderWidth: 2,
    borderColor: colors.fieldBorder,
    backgroundColor: colors.fieldBg,
    borderRadius: radii.field,
    height: sizing.fieldHeight,
  },

  fieldError: {
    borderColor: colors.errorRed,
  },

  // ── Modal container ──
  modal: {
    backgroundColor: colors.cream,
    borderRadius: radii.modal,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: colors.ink,
    ...shadows.card,
  },

  // ── Overlay backdrop ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayLight,
  },

  // ── Text shadow (used on Button label, EmptyState, LockOverlay) ──
  textShadow: {
    textShadowColor: colors.textShadowWhite,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // ── Button pressed state (Neo-Brutalism push effect) ──
  buttonPressed: {
    opacity: 0.8,
  },

  // ── Success field (code preview, validated inputs) ──
  successField: {
    backgroundColor: colors.successBgTint,
    borderColor: colors.successBorderTint,
  },
});
