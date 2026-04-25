import type { GiftRecord } from '@unbogi/shared';
import { FlipCard, GiftBack, Postcard } from '@/ui';
import type { GiftScreenStrategy, OverlayContext } from './strategies';

interface GiftCardItemProps {
  gift: GiftRecord;
  strategy: GiftScreenStrategy;
  isUnlocked: boolean;
  isScratched: boolean;
  onScratched: (giftId: string) => void;
  resolveHoliday: (holidayId: string) => string;
}

/**
 * Composite (GoF) — a single slide in the gift slider.
 *
 * Owns its full layer stack:
 *   z-0   FlipCard  (Postcard front ↔ GiftBack back)
 *   z-10+ strategy.renderOverlays() — injected by the active strategy
 *
 * The strategy decides which overlays to mount (Lock + Scratch for surprises,
 * nothing for collection), keeping this component strategy-agnostic.
 */
export function GiftCardItem({
  gift,
  strategy,
  isUnlocked,
  isScratched,
  onScratched,
  resolveHoliday,
}: GiftCardItemProps) {
  const date = strategy.selectDate(gift);
  const ctx: OverlayContext = { isUnlocked, onScratched };
  // Surprises: flip only available after scratch. Collection: always flippable.
  const flipDisabled = strategy.mode === 'surprises' && !isScratched;

  return (
    <div className="relative w-full h-full rounded-[inherit]">
      {/* Strategy-injected overlays (LockOverlay + ScratchCanvas, or null) */}
      {strategy.renderOverlays(gift, ctx)}

      {/* Layer 0 — FlipCard: always present, always at the bottom */}
      <div className="absolute inset-0 z-0 rounded-[inherit]">
        <FlipCard
          disabled={flipDisabled}
          front={
            <Postcard
              imageUrl={gift.imageUrl}
              additionalInfo={{ from: gift.senderName, date, id: gift.id }}
              imageOverlay={strategy.renderImageOverlay?.(gift, ctx)}
            />
          }
          back={
            <GiftBack
              holidayName={resolveHoliday(gift.holidayId)}
              greeting={gift.greeting}
              senderName={gift.senderName}
              date={date}
              code={{ value: gift.scratchCode.value, format: gift.scratchCode.format }}
            />
          }
        />
      </div>
    </div>
  );
}
