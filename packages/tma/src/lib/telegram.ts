/**
 * Isolated Telegram WebApp SDK bridge.
 * All TG API access goes through this module — single point for mocking & future changes.
 */

import type { HapticImpactStyle, TelegramUser, TelegramWebApp } from '@/types/telegram-webapp';

const getWebApp = (): TelegramWebApp | undefined => window.Telegram?.WebApp;

/**
 * Runtime type guard for TelegramUser.
 * Validates that the raw object from initDataUnsafe has the expected shape.
 */
function isValidTelegramUser(raw: unknown): raw is TelegramUser {
  if (typeof raw !== 'object' || raw === null) return false;
  const obj = raw as Record<string, unknown>;
  return typeof obj.id === 'number' && typeof obj.first_name === 'string';
}

/** Cached validated user — parsed once from initDataUnsafe. */
let _cachedUser: TelegramUser | null = null;

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

  /** Validated Telegram user object. Returns null if data is missing or malformed. */
  get user(): TelegramUser | null {
    if (_cachedUser) return _cachedUser;
    const raw = getWebApp()?.initDataUnsafe?.user;
    if (!isValidTelegramUser(raw)) {
      if (raw !== undefined) console.warn('[TG] Invalid user data in initDataUnsafe:', raw);
      return null;
    }
    _cachedUser = raw;
    return _cachedUser;
  },

  get userId(): number | undefined {
    return this.user?.id;
  },

  get languageCode(): string | undefined {
    return this.user?.language_code;
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

/**
 * Higher-order function that wraps a callback with haptic feedback.
 * Eliminates repeated `tg.haptic('light'); fn()` boilerplate.
 *
 * @example
 * onClick={withHaptic(onInviteClick)}         // defaults to 'light'
 * onClick={withHaptic(onSendClick, 'medium')} // custom intensity
 */
export function withHaptic<A extends unknown[]>(
  fn: (...args: A) => void,
  level: HapticImpactStyle = 'light',
): (...args: A) => void {
  return (...args) => {
    tg.haptic(level);
    fn(...args);
  };
}
