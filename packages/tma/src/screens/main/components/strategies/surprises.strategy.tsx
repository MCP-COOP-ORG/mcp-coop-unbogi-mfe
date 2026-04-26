import { ASSETS } from '@/lib';
import { LockOverlay, ScratchCanvas } from '@/ui';
import type { GiftScreenStrategy } from './types';

/**
 * Surprises strategy — received (not yet opened) gifts.
 *
 * Layers:
 *   z-20  renderOverlays    → LockOverlay  (covers full card transparently)
 *   image renderImageOverlay → ScratchCanvas (confined inside Postcard image div)
 */
export const surprisesStrategy: GiftScreenStrategy = {
  mode: 'surprises',
  requiresTimer: true,

  selectGifts: ({ receivedGifts }) => receivedGifts,
  selectDate: (gift) => new Date(gift.unpackDate),
  emptyLabel: (t) => t.surprises.empty,

  /** Full-card overlay — only the transparent LockOverlay countdown. */
  renderOverlays: (gift, { isUnlocked }) => (
    <>{!isUnlocked && <LockOverlay lockedUntil={new Date(gift.unpackDate)} senderName={gift.senderName} />}</>
  ),

  /** Image-area overlay — ScratchCanvas clipped inside the Postcard image div. */
  renderImageOverlay: (gift, { isUnlocked, onScratched }) => (
    <ScratchCanvas
      clearThreshold={40}
      brushSize={80}
      frostOpacity={0.6}
      isUnlocked={isUnlocked}
      imageUrl={gift.imageUrl}
      logoUrl={ASSETS.LOGO}
      onReveal={() => onScratched(gift.id)}
    />
  ),
};
