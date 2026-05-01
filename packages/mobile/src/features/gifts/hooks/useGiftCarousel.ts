import { type GiftRecord, useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GiftStrategy } from '../types';
import { useGiftTimer } from './useGiftTimer';

interface UseGiftCarouselResult {
  gifts: GiftRecord[];
  unlockedIds: Set<string>;
  scratchedIds: Set<string>;
  holidayMap: Map<string, string>;
  isLoading: boolean;
  isLoaded: boolean;
  onScratched: (id: string) => void;
  resolveHoliday: (id: string) => string;
}

export function useGiftCarousel(strategy: GiftStrategy): UseGiftCarouselResult {
  const receivedGifts = useGiftsStore((s) => s.receivedGifts);
  const openedGifts = useGiftsStore((s) => s.openedGifts);
  const scratchGift = useGiftsStore((s) => s.scratchGift);
  const loadGifts = useGiftsStore((s) => s.loadGifts);
  const isLoading = useGiftsStore((s) => s.isLoading);
  const isLoaded = useGiftsStore((s) => s.isLoaded);

  const holidays = useHolidaysStore((s) => s.holidays);
  const loadHolidays = useHolidaysStore((s) => s.loadHolidays);

  const gifts = useMemo(
    () => strategy.selectGifts({ receivedGifts, openedGifts }),
    [strategy, receivedGifts, openedGifts],
  );
  const unlockedIds = useGiftTimer(gifts, Boolean(strategy.requiresTimer));
  const [scratchedIds, setScratchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGifts();
    loadHolidays();
  }, [loadGifts, loadHolidays]);

  const onScratched = useCallback(
    (id: string) => {
      scratchGift(id);
      setScratchedIds((prev) => new Set(prev).add(id));
    },
    [scratchGift],
  );

  const holidayMap = useMemo(() => new Map(holidays.map((h) => [h.id, h.name])), [holidays]);
  const resolveHoliday = useCallback((id: string) => holidayMap.get(id) ?? id, [holidayMap]);

  return { gifts, unlockedIds, scratchedIds, holidayMap, isLoading, isLoaded, onScratched, resolveHoliday };
}
