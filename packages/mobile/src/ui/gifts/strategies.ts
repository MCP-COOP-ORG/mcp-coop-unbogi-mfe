import type { GiftRecord } from '@unbogi/shared';

export interface GiftScreenStrategy {
  name: 'surprises' | 'collection';
  requiresTimer: boolean;
  emptyLabel: string;
  selectGifts: (state: { receivedGifts: GiftRecord[]; openedGifts: GiftRecord[] }) => GiftRecord[];
}

export const surprisesStrategy: GiftScreenStrategy = {
  name: 'surprises',
  requiresTimer: true,
  emptyLabel: 'NO SURPRISES YET',
  selectGifts: (state) => state.receivedGifts,
};

export const collectionStrategy: GiftScreenStrategy = {
  name: 'collection',
  requiresTimer: false,
  emptyLabel: 'COLLECTION EMPTY',
  selectGifts: (state) => state.openedGifts,
};
