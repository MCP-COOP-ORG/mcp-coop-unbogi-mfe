import { type ReactNode, useEffect } from 'react';
import { tg } from '@/lib/telegram';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Notify Telegram to drop the native loader and expand WebView
    tg.ready();
    tg.expand();

    // Lock height to prevent virtual keyboard from squishing the app
    const h = window.innerHeight;
    document.documentElement.style.setProperty('--locked-app-height', `${h}px`);
  }, []);

  return <>{children}</>;
}
