import type { GiftRecord } from '@unbogi/shared';

export interface GiftStrategy {
  name: 'surprises' | 'collection';
  requiresTimer: boolean;
  emptyLabel: string;
  selectGifts: (state: { receivedGifts: GiftRecord[]; openedGifts: GiftRecord[] }) => GiftRecord[];
}
