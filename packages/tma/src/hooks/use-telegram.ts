import { useEffect } from 'react';
import { tg } from '@/lib/telegram';

/**
 * Hook to integrate Telegram BackButton with screen navigation.
 * Returns cleanup automatically on unmount.
 */
export function useTelegramBackButton(onBack: () => void) {
  useEffect(() => {
    if (!tg.isTelegram) return;
    return tg.showBackButton(onBack);
  }, [onBack]);
}
