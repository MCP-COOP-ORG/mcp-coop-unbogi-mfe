import { useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/hooks/use-t';
import { FlipCard } from '@/ui/flip-card';
import { GiftBack } from '@/ui/gift-back';
import { LockOverlay } from '@/ui/lock-overlay';
import { Postcard } from '@/ui/postcard';
import { ScratchCanvas } from '@/ui/scratch-canvas';
import { Slider } from '@/ui/slider';

/** Spinner shown while gifts are loading. */
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-[var(--color-primary)] animate-spin" />
    </div>
  );
}

/** Placeholder shown when there are no received gifts yet. */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50 px-8 text-center">
      <span className="text-4xl">🎁</span>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}

/**
 * Surprises screen — 3-layer architecture matching UnBoGi/frontend:
 *   Layer 0 (z-0):  FlipCard — Postcard front ↔ GiftBack back
 *   Layer 1 (z-10): ScratchCanvas — gold foil, scratch to reveal
 *   Layer 2 (z-20): LockOverlay — countdown timer until unpackDate
 */
export function SurprisesScreen() {
  const { receivedGifts: gifts, scratchGift, loadGifts, isLoaded, isLoading } = useGiftsStore();
  const { holidays, loadHolidays } = useHolidaysStore();
  const t = useT();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGifts();
    loadHolidays();
  }, [loadGifts, loadHolidays]);

  // Tick every second to re-evaluate which gifts have passed their unpackDate
  useEffect(() => {
    if (gifts.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setUnlockedIds((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const gift of gifts) {
          if (new Date(gift.unpackDate).getTime() <= now) {
            if (!next.has(gift.id)) {
              next.add(gift.id);
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gifts]);

  const handleScratched = useCallback(
    (giftId: string) => {
      scratchGift(giftId);
    },
    [scratchGift],
  );

  if (!isLoaded || isLoading) return <LoadingState />;
  if (gifts.length === 0) return <EmptyState label={t.surprises.empty} />;

  /** Resolve holidayId to a human-readable name. Falls back to the raw id. */
  const resolveHolidayName = (holidayId: string): string => {
    const found = holidays.find((h) => h.id === holidayId);
    return found?.name ?? holidayId;
  };

  return (
    <div className="w-full h-full">
      <Slider
        items={gifts}
        getKey={(gift) => gift.id}
        renderItem={(gift) => {
          const isUnlocked = unlockedIds.has(gift.id);
          const lockedUntil = new Date(gift.unpackDate);
          return (
            <div className="relative w-full h-full rounded-[inherit]">
              {/* Layer 2: Timer Lock (Topmost) */}
              {!isUnlocked && <LockOverlay lockedUntil={lockedUntil} senderName={gift.senderName} />}

              {/* Layer 1: Scratch Foil (Middle) */}
              <div className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] overflow-hidden">
                <ScratchCanvas
                  clearThreshold={40}
                  brushSize={80}
                  isUnlocked={isUnlocked}
                  onReveal={() => handleScratched(gift.id)}
                />
              </div>

              {/* Layer 0: The Flip Card (Bottom) */}
              <div className="absolute inset-0 z-0 rounded-[inherit]">
                <FlipCard
                  front={
                    <Postcard
                      imageUrl={gift.imageUrl}
                      additionalInfo={{
                        from: gift.senderName,
                        date: new Date(gift.unpackDate),
                        id: gift.id,
                      }}
                    />
                  }
                  back={
                    <GiftBack
                      holidayName={resolveHolidayName(gift.holidayId)}
                      greeting={gift.greeting}
                      senderName={gift.senderName}
                      date={new Date(gift.unpackDate)}
                      code={{ value: gift.scratchCode.value, format: gift.scratchCode.format }}
                    />
                  }
                />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
