import { describe, expect, it } from 'vitest';
import { collectionStrategy, surprisesStrategy } from '@/screens/main/components/strategies';
import { useGiftModeStore } from './gift-mode.store';

describe('gift-mode.store', () => {
  it('should initialize with surprisesStrategy', () => {
    const { strategy } = useGiftModeStore.getState();
    expect(strategy).toBe(surprisesStrategy);
  });

  it('should set strategy correctly', () => {
    useGiftModeStore.getState().setStrategy(collectionStrategy);
    expect(useGiftModeStore.getState().strategy).toBe(collectionStrategy);

    // reset for future tests
    useGiftModeStore.getState().setStrategy(surprisesStrategy);
  });
});
