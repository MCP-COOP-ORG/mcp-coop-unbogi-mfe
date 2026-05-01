import type { GiftStrategy } from './types';

export const surprisesStrategy: GiftStrategy = {
  name: 'surprises',
  requiresTimer: true,
  emptyLabel: 'NO SURPRISES YET',
  selectGifts: (state) => state.receivedGifts,
};

export const collectionStrategy: GiftStrategy = {
  name: 'collection',
  requiresTimer: false,
  emptyLabel: 'COLLECTION EMPTY',
  selectGifts: (state) => state.openedGifts,
};
