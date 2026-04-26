import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { tg } from '@/lib';
import { useTelegramBackButton } from './use-telegram';

vi.mock('@/lib', () => ({
  tg: {
    isTelegram: true,
    showBackButton: vi.fn(),
  },
}));

describe('useTelegramBackButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers back button if in telegram', () => {
    Object.defineProperty(tg, 'isTelegram', { value: true, configurable: true });
    const cleanupMock = vi.fn();
    (tg.showBackButton as Mock).mockReturnValue(cleanupMock);

    const onBack = vi.fn();
    const { unmount } = renderHook(() => useTelegramBackButton(onBack));

    expect(tg.showBackButton).toHaveBeenCalledWith(onBack);

    unmount();
    expect(cleanupMock).toHaveBeenCalled();
  });

  it('does nothing if not in telegram', () => {
    Object.defineProperty(tg, 'isTelegram', { value: false, configurable: true });
    const onBack = vi.fn();
    renderHook(() => useTelegramBackButton(onBack));

    expect(tg.showBackButton).not.toHaveBeenCalled();
  });
});
