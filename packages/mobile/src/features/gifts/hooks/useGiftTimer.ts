import type { GiftRecord } from '@unbogi/shared';
import { useEffect, useState } from 'react';

/**
 * Hook to manage unlocking state based on unpackDate.
 * Periodically checks which gifts should be unlocked.
 */
export function useGiftTimer(gifts: GiftRecord[], enabled: boolean) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || gifts.length === 0) return;

    let timer: NodeJS.Timeout;

    const checkUnlocks = () => {
      const now = Date.now();
      let nextUnlockTime = Infinity;

      setUnlockedIds((prev) => {
        const next = new Set(prev);
        let changed = false;

        for (const gift of gifts) {
          if (!next.has(gift.id)) {
            const unlockTime = new Date(gift.unpackDate).getTime();
            if (unlockTime <= now) {
              next.add(gift.id);
              changed = true;
            } else if (unlockTime < nextUnlockTime) {
              nextUnlockTime = unlockTime;
            }
          }
        }
        return changed ? next : prev;
      });

      if (nextUnlockTime !== Infinity) {
        const delay = nextUnlockTime - Date.now();
        timer = setTimeout(checkUnlocks, Math.max(0, delay + 100)); // +100ms for safety buffer
      }
    };

    checkUnlocks();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled, gifts]);

  return unlockedIds;
}
