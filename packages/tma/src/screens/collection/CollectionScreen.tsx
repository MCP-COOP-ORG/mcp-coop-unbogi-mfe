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

/** Placeholder shown when the collection is empty. */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50 px-8 text-center">
      <span className="text-4xl">🎁</span>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}

/**
 * Collection screen — displays opened gifts as flippable postcards.
 * Front: postcard image. Back: holiday title, greeting, activation code.
 */
export function CollectionScreen() {
  const { openedGifts: gifts, loadGifts, isLoaded, isLoading } = useGiftsStore();
  const { holidays, loadHolidays } = useHolidaysStore();
  const t = useT();

  useEffect(() => {
    loadGifts();
    loadHolidays();
  }, [loadGifts, loadHolidays]);

  if (!isLoaded || isLoading) return <LoadingState />;
  if (gifts.length === 0) return <EmptyState label={t.collection.empty} />;

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
        renderItem={(gift) => (
          <FlipCard
            front={
              <Postcard
                imageUrl={gift.imageUrl}
                additionalInfo={{
                  from: gift.senderName,
                  date: new Date(gift.scratchedAt ?? gift.createdAt),
                  id: gift.id,
                }}
              />
            }
            back={
              <GiftBack
                holidayName={resolveHolidayName(gift.holidayId)}
                greeting={gift.greeting}
                senderName={gift.senderName}
                date={new Date(gift.scratchedAt ?? gift.createdAt)}
                code={{ value: gift.scratchCode.value, format: gift.scratchCode.format }}
              />
            }
          />
        )}
      />
    </div>
  );
}
