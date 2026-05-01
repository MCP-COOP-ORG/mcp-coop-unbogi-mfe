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

    const checkUnlocks = () => {
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
    };

    // Initial check
    checkUnlocks();

    const timer = setInterval(checkUnlocks, 1000);
    return () => clearInterval(timer);
  }, [enabled, gifts]);

  return unlockedIds;
}
