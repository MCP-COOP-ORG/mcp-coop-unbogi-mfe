import { describe, it, expect, vi } from 'vitest';
import { formatLocalDate } from './format';

vi.mock('@unbogi/shared', () => ({
  APP_CONFIG: {
    DEFAULT_LOCALE: 'en-US',
  },
}));

describe('format.ts', () => {
  const testDate = new Date('2026-04-26T12:00:00Z');

  it('formats date using "short" preset', () => {
    // Expected for en-US: "Apr 26, 2026"
    expect(formatLocalDate(testDate, 'short')).toMatch(/Apr 26, 2026/);
  });

  it('formats date using "full" preset', () => {
    // Expected for en-US: "April 26, 2026"
    expect(formatLocalDate(testDate, 'full')).toMatch(/April 26, 2026/);
  });

  it('formats date using "numeric" preset', () => {
    // Expected for en-US: "04/26/2026"
    expect(formatLocalDate(testDate, 'numeric')).toMatch(/04\/26\/2026/);
  });

  it('accepts string date input', () => {
    expect(formatLocalDate('2026-04-26T12:00:00Z', 'numeric')).toMatch(/04\/26\/2026/);
  });
});
