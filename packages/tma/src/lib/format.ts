/**
 * Date formatting helpers.
 *
 * Replaces duplicated `toLocaleDateString(APP_CONFIG.DEFAULT_LOCALE, {...})`
 * calls across Postcard, LockOverlay, and GiftBack with a single utility.
 */

import { APP_CONFIG } from '@unbogi/shared';

export type DatePreset = 'short' | 'full' | 'numeric';

const DATE_PRESETS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  short: { day: 'numeric', month: 'short', year: 'numeric' },
  full: { day: 'numeric', month: 'long', year: 'numeric' },
  numeric: { day: '2-digit', month: '2-digit', year: 'numeric' },
};

/**
 * Format a date using a named preset and the app's default locale.
 *
 * @example
 * formatLocalDate(new Date(), 'short')  // "26 Apr 2026"
 * formatLocalDate(new Date(), 'full')   // "26 April 2026"
 * formatLocalDate(new Date(), 'numeric') // "26.04.2026"
 */
export function formatLocalDate(date: Date | string, preset: DatePreset): string {
  return new Date(date).toLocaleDateString(APP_CONFIG.DEFAULT_LOCALE, DATE_PRESETS[preset]);
}
