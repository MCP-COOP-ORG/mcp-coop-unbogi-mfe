/**
 * Date formatting utilities.
 * Replaces inline formatting scattered across components.
 */

/** Format ISO date string to localized display (e.g. "01 мая 2026") */
export function formatDate(iso: string, locale = 'ru-RU'): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Format remaining milliseconds to countdown string.
 * Returns "2д 3ч" or "5ч 10м" or "< 1м"
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0м';

  const totalMinutes = Math.floor(ms / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    const remainingHours = totalHours % 24;
    return `${totalDays}д ${remainingHours}ч`;
  }

  if (totalHours > 0) {
    const remainingMinutes = totalMinutes % 60;
    return `${totalHours}ч ${remainingMinutes}м`;
  }

  if (totalMinutes > 0) {
    return `${totalMinutes}м`;
  }

  return '< 1м';
}
