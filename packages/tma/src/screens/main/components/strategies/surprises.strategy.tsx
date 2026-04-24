import { LockOverlay, ScratchCanvas } from '@/ui';
import type { GiftScreenStrategy } from './types';

/**
 * Surprises strategy — received (not yet opened) gifts.
 *
 * Layers rendered on top of FlipCard:
 *   z-20  LockOverlay  — countdown until unpackDate
 *   z-10  ScratchCanvas — gold foil the user scratches away
 */
export const surprisesStrategy: GiftScreenStrategy = {
  mode: 'surprises',
  requiresTimer: true,

  selectGifts: ({ receivedGifts }) => receivedGifts,
  selectDate: (gift) => new Date(gift.unpackDate),
  emptyLabel: (t) => t.surprises.empty,

  renderOverlays: (gift, { isUnlocked, onScratched }) => (
    <>
      {/* Layer 2 — lock countdown (topmost, removed once unlocked) */}
      {!isUnlocked && (
        <LockOverlay lockedUntil={new Date(gift.unpackDate)} senderName={gift.senderName} />
      )}

      {/* Layer 1 — scratch foil (pointer-events delegated to canvas internals) */}
      <div className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] overflow-hidden">
        <ScratchCanvas
          clearThreshold={40}
          brushSize={80}
          isUnlocked={isUnlocked}
          onReveal={() => onScratched(gift.id)}
        />
      </div>
    </>
  ),
};
