import { act, renderHook } from '@testing-library/react-native';
import type { GiftRecord } from '@unbogi/shared';
import { useGiftTimer } from './useGiftTimer';

describe('useGiftTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('initially unlocks gifts that are past their unpackDate', () => {
    const gifts = [
      { id: '1', unpackDate: new Date(Date.now() - 1000).toISOString() },
      { id: '2', unpackDate: new Date(Date.now() + 10000).toISOString() },
    ] as unknown as GiftRecord[];

    const { result } = renderHook(() => useGiftTimer(gifts, true));

    expect(result.current.has('1')).toBe(true);
    expect(result.current.has('2')).toBe(false);
  });

  it('unlocks gifts when their unpackDate arrives', () => {
    const gifts = [{ id: '1', unpackDate: new Date(Date.now() + 1000).toISOString() }] as unknown as GiftRecord[];

    const { result } = renderHook(() => useGiftTimer(gifts, true));

    expect(result.current.has('1')).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(result.current.has('1')).toBe(true);
  });

  it('does nothing if disabled', () => {
    const gifts = [{ id: '1', unpackDate: new Date(Date.now() - 1000).toISOString() }] as unknown as GiftRecord[];

    const { result } = renderHook(() => useGiftTimer(gifts, false));

    expect(result.current.has('1')).toBe(false);
  });
});
