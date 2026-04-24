import type { GiftRecord } from '@unbogi/shared';
import type { ReactNode } from 'react';
import type { Translations } from '@/lib/i18n';

// Context passed to renderOverlays so the strategy can wire up scratch/unlock.
export interface OverlayContext {
  isUnlocked: boolean;
  onScratched: (giftId: string) => void;
}

/**
 * Strategy (GoF) — encapsulates the variable parts of the gift screen:
 *   - which gift slice to display
 *   - which date field to use
 *   - which overlay layers to render (Lock + Scratch, or none)
 *   - whether the countdown timer is needed
 */
export interface GiftScreenStrategy {
  readonly mode: 'surprises' | 'collection';
  readonly requiresTimer: boolean;

  selectGifts(store: { receivedGifts: GiftRecord[]; openedGifts: GiftRecord[] }): GiftRecord[];
  selectDate(gift: GiftRecord): Date;
  emptyLabel(t: Translations): string;
  renderOverlays(gift: GiftRecord, ctx: OverlayContext): ReactNode;
}
