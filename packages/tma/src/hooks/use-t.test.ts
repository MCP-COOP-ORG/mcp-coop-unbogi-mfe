import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { tg } from '@/lib';
import { useT } from './use-t';

vi.mock('@/lib', () => ({
  tg: {
    languageCode: 'en',
  },
  translations: {
    en: { giftBack: { activationCode: 'English' } },
    ru: { giftBack: { activationCode: 'Russian' } },
  },
}));

describe('useT', () => {
  it('returns translation based on tg.languageCode', () => {
    Object.defineProperty(tg, 'languageCode', { value: 'ru' });
    const { result } = renderHook(() => useT());
    expect(result.current.giftBack.activationCode).toBe('Russian');
  });

  it('falls back to english if language not found', () => {
    Object.defineProperty(tg, 'languageCode', { value: 'fr' });
    const { result } = renderHook(() => useT());
    expect(result.current.giftBack.activationCode).toBe('English');
  });
});
