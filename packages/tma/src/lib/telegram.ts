/**
 * Isolated Telegram WebApp SDK bridge.
 * All TG API access goes through this module — single point for mocking & future changes.
 */

const getWebApp = () => window.Telegram?.WebApp;

export const tg = {
  get initData(): string {
    return getWebApp()?.initData ?? '';
  },

  get isTelegram(): boolean {
    return (getWebApp()?.initData?.length ?? 0) > 0;
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

  haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    try {
      getWebApp()?.HapticFeedback?.impactOccurred?.(type);
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
