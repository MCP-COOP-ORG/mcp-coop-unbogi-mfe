import { useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { useEffect } from 'react';
import { useT } from '@/hooks/use-t';
import { FlipCard } from '@/ui/flip-card';
import { GiftBack } from '@/ui/gift-back';
import { Postcard } from '@/ui/postcard';
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
 * Surprises screen — displays received gifts as flippable postcards.
 * UI is identical to CollectionScreen; data source is receivedGifts instead of openedGifts.
 *
 * TODO: add <LockOverlay> + <ScratchCanvas> per card when those features are ready.
 */
export function SurprisesScreen() {
  const { receivedGifts: gifts, loadGifts, isLoaded, isLoading } = useGiftsStore();
  const { holidays, loadHolidays } = useHolidaysStore();
  const t = useT();

  useEffect(() => {
    loadGifts();
    loadHolidays();
  }, [loadGifts, loadHolidays]);

  if (!isLoaded || isLoading) return <LoadingState />;
  if (gifts.length === 0) return <EmptyState label={t.surprises.empty} />;

  /** Resolve holidayId to a human-readable name. Falls back to the raw id. */
  const resolveHolidayName = (holidayId: string): string => {
    const found = holidays.find((h) => h.id === holidayId);
    return found?.name ?? holidayId;
  };

  return (
    <div className="w-full flex flex-col items-center pt-6 px-4">
      <div className="w-full" style={{ aspectRatio: '3/4', maxHeight: 'calc(100vh - 160px)' }}>
      <Slider
        items={gifts}
        getKey={(gift) => gift.id}
        renderItem={(gift) => (
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
        )}
      />
      </div>
    </div>
  );
}
