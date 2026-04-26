import { render } from '@testing-library/react';
import type { GiftRecord } from '@unbogi/shared';
import { describe, expect, it, vi } from 'vitest';
import type { Translations } from '@/lib';
import { surprisesStrategy } from './surprises.strategy';

// Mock UI components that are rendered by the strategy
vi.mock('@/ui', () => ({
  LockOverlay: () => <div data-testid="lock-overlay" />,
  ScratchCanvas: () => <div data-testid="scratch-canvas" />,
}));

describe('surprises.strategy', () => {
  it('has correct mode and properties', () => {
    expect(surprisesStrategy.mode).toBe('surprises');
    expect(surprisesStrategy.requiresTimer).toBe(true);
  });

  it('selectGifts returns receivedGifts', () => {
    const mockState = { openedGifts: [{ id: '1' } as GiftRecord], receivedGifts: [{ id: '2' } as GiftRecord] };
    expect(surprisesStrategy.selectGifts(mockState)).toEqual([{ id: '2' }]);
  });

  it('selectDate returns unpackDate', () => {
    const gift = { unpackDate: '2023-01-01', scratchedAt: '2025-01-01' } as unknown as GiftRecord;
    expect(surprisesStrategy.selectDate(gift).toISOString()).toBe(new Date('2023-01-01').toISOString());
  });

  it('emptyLabel returns translation string', () => {
    const mockT = { surprises: { empty: 'Empty surprises' } } as unknown as Translations;
    expect(surprisesStrategy.emptyLabel(mockT)).toBe('Empty surprises');
  });

  it('renderOverlays renders LockOverlay if not unlocked', () => {
    const gift = { unpackDate: '2025-01-01', senderName: 'Alice' } as unknown as GiftRecord;
    const { getByTestId, queryByTestId, rerender } = render(
      surprisesStrategy.renderOverlays(gift, { isUnlocked: false, onScratched: vi.fn() }),
    );
    expect(getByTestId('lock-overlay')).toBeInTheDocument();

    rerender(surprisesStrategy.renderOverlays(gift, { isUnlocked: true, onScratched: vi.fn() }));
    expect(queryByTestId('lock-overlay')).not.toBeInTheDocument();
  });

  it('renderImageOverlay renders ScratchCanvas', () => {
    const gift = { imageUrl: 'http://test.com/img.jpg', id: '1' } as unknown as GiftRecord;
    const { getByTestId } = render(
      surprisesStrategy.renderImageOverlay!(gift, { isUnlocked: true, onScratched: vi.fn() }),
    );
    expect(getByTestId('scratch-canvas')).toBeInTheDocument();
  });
});
