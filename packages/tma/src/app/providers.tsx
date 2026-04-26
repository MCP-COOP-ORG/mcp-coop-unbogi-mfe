import { type ReactNode, useEffect } from 'react';
import { tg } from '@/lib';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root provider shell.
 * Initialises the Telegram WebApp SDK and locks the viewport height
 * so the virtual keyboard cannot squish the layout.
 *
 * i18n is handled via the lightweight useT() hook — no external provider needed.
 */
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Signal Telegram that the Mini App is ready and request full-screen mode
    tg.ready();
    tg.expand();

    // Capture the initial viewport height before the virtual keyboard appears
    const h = window.innerHeight;
    document.documentElement.style.setProperty('--locked-app-height', `${h}px`);
  }, []);

  return <>{children}</>;
}
