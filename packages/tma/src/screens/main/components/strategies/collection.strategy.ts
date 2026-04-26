import type { GiftScreenStrategy } from './types';

/**
 * Collection strategy — already opened (scratched) gifts.
 *
 * No extra overlay layers; only the bare FlipFlap is rendered.
 * Timer is not required because all gifts here are past their unpackDate.
 */
export const collectionStrategy: GiftScreenStrategy = {
  mode: 'collection',
  requiresTimer: false,

  selectGifts: ({ openedGifts }) => openedGifts,
  selectDate: (gift) => new Date(gift.scratchedAt ?? gift.createdAt ?? gift.unpackDate),
  emptyLabel: (t) => t.collection.empty,

  renderOverlays: () => null,
};
