import type { GiftRecord } from '@unbogi/shared';
import { describe, expect, it } from 'vitest';
import type { Translations } from '@/lib';
import { collectionStrategy } from './collection.strategy';
import type { OverlayContext } from './types';

describe('collection.strategy', () => {
  it('has correct mode and properties', () => {
    expect(collectionStrategy.mode).toBe('collection');
    expect(collectionStrategy.requiresTimer).toBe(false);
  });

  it('selectGifts returns openedGifts', () => {
    const mockState = { openedGifts: [{ id: '1' } as GiftRecord], receivedGifts: [{ id: '2' } as GiftRecord] };
    expect(collectionStrategy.selectGifts(mockState)).toEqual([{ id: '1' }]);
  });

  it('selectDate returns scratchedAt if available, else createdAt, else unpackDate', () => {
    const giftScratched = {
      scratchedAt: '2025-01-01',
      createdAt: '2024-01-01',
      unpackDate: '2023-01-01',
    } as unknown as GiftRecord;
    const giftCreated = { createdAt: '2024-01-01', unpackDate: '2023-01-01' } as unknown as GiftRecord;
    const giftUnpack = { unpackDate: '2023-01-01' } as unknown as GiftRecord;

    expect(collectionStrategy.selectDate(giftScratched).toISOString()).toBe(new Date('2025-01-01').toISOString());
    expect(collectionStrategy.selectDate(giftCreated).toISOString()).toBe(new Date('2024-01-01').toISOString());
    expect(collectionStrategy.selectDate(giftUnpack).toISOString()).toBe(new Date('2023-01-01').toISOString());
  });

  it('emptyLabel returns translation string', () => {
    const mockT = { collection: { empty: 'Empty collection' } } as unknown as Translations;
    expect(collectionStrategy.emptyLabel(mockT)).toBe('Empty collection');
  });

  it('renderOverlays returns null', () => {
    expect(collectionStrategy.renderOverlays({} as GiftRecord, {} as OverlayContext)).toBeNull();
  });
});
