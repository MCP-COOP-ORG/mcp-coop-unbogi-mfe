/**
 * Isolated Telegram WebApp SDK bridge.
 * All TG API access goes through this module — single point for mocking & future changes.
 */

import type { HapticImpactStyle, TelegramWebApp } from '@/types/telegram-webapp';

const getWebApp = (): TelegramWebApp | undefined => window.Telegram?.WebApp;

export const tg = {
  get initData(): string {
    return getWebApp()?.initData ?? '';
  },

  get startParam(): string | undefined {
    return getWebApp()?.initDataUnsafe?.start_param;
  },

  get isTelegram(): boolean {
    return (getWebApp()?.initData?.length ?? 0) > 0;
  },

  /** Returns true if initData is present and non-empty — safe to send to backend. */
  get isInitDataPresent(): boolean {
    return this.initData.length > 0;
  },

  get userId(): number | undefined {
    return getWebApp()?.initDataUnsafe?.user?.id;
  },

  get languageCode(): string | undefined {
    return getWebApp()?.initDataUnsafe?.user?.language_code;
  },

  ready() {
    try {
      getWebApp()?.ready?.();
    } catch (e) {
      console.warn('[TG] ready() failed:', e);
    }
  },

  expand() {
    try {
      getWebApp()?.expand?.();
    } catch (e) {
      console.warn('[TG] expand() failed:', e);
    }
  },

  haptic(type: HapticImpactStyle = 'light') {
    try {
      getWebApp()?.HapticFeedback?.impactOccurred?.(type);
    } catch {
      // Silently fail outside TG
    }
  },

  hapticNotification(type: 'error' | 'success' | 'warning') {
    try {
      getWebApp()?.HapticFeedback?.notificationOccurred?.(type);
    } catch {
      // Silently fail outside TG
    }
  },

  showBackButton(onClick: () => void) {
    const bb = getWebApp()?.BackButton;
    if (!bb) return;
    bb.show();
    bb.onClick(onClick);
    return () => {
      bb.offClick(onClick);
      bb.hide();
    };
  },

  scanQr(promptText: string): Promise<string | null> {
    return new Promise((resolve) => {
      const wa = getWebApp();
      if (typeof wa?.showScanQrPopup !== 'function') {
        resolve(null);
        return;
      }
      wa.showScanQrPopup({ text: promptText }, (result: string) => {
        wa.closeScanQrPopup();
        resolve(result);
        return true;
      });
    });
  },

  close() {
    getWebApp()?.close?.();
  },
};
