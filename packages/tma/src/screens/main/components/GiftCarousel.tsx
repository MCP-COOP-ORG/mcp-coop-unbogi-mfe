import { type GiftRecord, useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/hooks/use-t';
import { useGiftModeStore } from '@/store';
import { Slider } from '@/ui';
import { GiftCardItem } from './GiftCardItem';

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-[var(--color-primary)] animate-spin" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
      <div
        className="w-[172px] h-[172px] bg-contain bg-center bg-no-repeat shrink-0 opacity-90"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}logo-3.png)` }}
      />
      <p
        className="text-[14px] uppercase tracking-[0.15em] font-bold mt-2"
        style={{ color: '#2b2a2c', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * GiftCarousel — Template Method (GoF).
 *
 * Renders the gift slider for the active strategy (surprises / collection).
 * Owned by MainScreen; never mounts navigation or overlay concerns.
 */
export function GiftCarousel() {
  const strategy = useGiftModeStore((s) => s.strategy);
  const { receivedGifts, openedGifts, scratchGift, loadGifts, isLoaded, isLoading } = useGiftsStore();
  const { holidays, loadHolidays } = useHolidaysStore();
  const t = useT();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [scratchedIds, setScratchedIds] = useState<Set<string>>(new Set());

  // Step 1 — Bootstrap
  useEffect(() => {
    loadGifts();
    loadHolidays();
  }, [loadGifts, loadHolidays]);

  const gifts = strategy.selectGifts({ receivedGifts, openedGifts });

  // Step 2 — Countdown timer (surprises mode only)
  useEffect(() => {
    if (!strategy.requiresTimer || gifts.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setUnlockedIds((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const gift of gifts) {
          if (!next.has(gift.id) && new Date(gift.unpackDate).getTime() <= now) {
            next.add(gift.id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [strategy, gifts]);

  const onScratched = useCallback(
    (id: string) => {
      scratchGift(id);
      setScratchedIds((prev) => new Set(prev).add(id));
    },
    [scratchGift],
  );
  const resolveHoliday = (id: string) => holidays.find((h) => h.id === id)?.name ?? id;

  // Step 3 — Guards
  if (!isLoaded || isLoading) return <LoadingState />;
  if (gifts.length === 0) return <EmptyState label={strategy.emptyLabel(t)} />;

  // Step 4 — Render
  return (
    <div className="w-full h-full">
      <Slider<GiftRecord>
        items={gifts}
        getKey={(g) => g.id}
        renderItem={(gift) => (
          <GiftCardItem
            key={gift.id}
            gift={gift}
            strategy={strategy}
            isUnlocked={unlockedIds.has(gift.id)}
            isScratched={scratchedIds.has(gift.id)}
            onScratched={onScratched}
            resolveHoliday={resolveHoliday}
          />
        )}
      />
    </div>
  );
}
