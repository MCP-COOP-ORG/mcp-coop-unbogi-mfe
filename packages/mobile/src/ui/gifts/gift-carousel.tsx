import { useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/ui/empty-state';
import { GiftCardItem } from './gift-card-item';
import { Slider } from './slider';
import type { GiftScreenStrategy } from './strategies';

interface GiftCarouselProps {
  strategy: GiftScreenStrategy;
}

export function GiftCarousel({ strategy }: GiftCarouselProps) {
  const { receivedGifts, openedGifts, scratchGift, loadGifts, isLoaded, isLoading } = useGiftsStore();
  const { holidays, loadHolidays } = useHolidaysStore();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [scratchedIds, setScratchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGifts();
    loadHolidays();
  }, [loadGifts, loadHolidays]);

  const gifts = strategy.selectGifts({ receivedGifts, openedGifts });

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

  const holidayMap = useMemo(() => new Map(holidays.map((h) => [h.id, h.name])), [holidays]);
  const resolveHoliday = useCallback((id: string) => holidayMap.get(id) ?? id, [holidayMap]);

  if (!isLoaded || isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (gifts.length === 0) {
    return <EmptyState label={strategy.emptyLabel} />;
  }

  return (
    <View style={styles.container}>
      <Slider
        items={gifts}
        getKey={(g) => g.id}
        renderItem={(gift) => (
          <GiftCardItem
            gift={gift}
            strategy={strategy}
            isUnlocked={unlockedIds.has(gift.id)}
            isScratched={scratchedIds.has(gift.id)}
            onScratched={onScratched}
            resolveHoliday={resolveHoliday}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 80,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
