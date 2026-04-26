// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We define a helper to mock window.Telegram before importing the module
// so that module-level caches (like _cachedUser) can be reset by dynamic imports
describe('telegram.ts', () => {
  beforeEach(() => {
    vi.resetModules();
    
    // Setup default mock for window.Telegram
    const MockWebApp = {
      initData: 'query_id=mock_data',
      initDataUnsafe: {
        user: { id: 123, first_name: 'Ivan', language_code: 'ru' },
        start_param: 'ref123',
      },
      ready: vi.fn(),
      expand: vi.fn(),
      HapticFeedback: {
        impactOccurred: vi.fn(),
        notificationOccurred: vi.fn(),
      },
      BackButton: {
        show: vi.fn(),
        hide: vi.fn(),
        onClick: vi.fn(),
        offClick: vi.fn(),
      },
      showScanQrPopup: vi.fn((_params, callback) => callback('test-qr-code')),
      closeScanQrPopup: vi.fn(),
      close: vi.fn(),
    };
    
    vi.stubGlobal('Telegram', { WebApp: MockWebApp });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('isInitDataPresent returns true when initData exists', async () => {
    const { tg } = await import('./telegram');
    expect(tg.isInitDataPresent).toBe(true);
    expect(tg.initData).toBe('query_id=mock_data');
  });

  it('returns false for isTelegram if initData is empty', async () => {
    window.Telegram.WebApp.initData = '';
    const { tg } = await import('./telegram');
    expect(tg.isTelegram).toBe(false);
    expect(tg.isInitDataPresent).toBe(false);
  });

  it('returns valid user object from initDataUnsafe', async () => {
    const { tg } = await import('./telegram');
    expect(tg.user).toEqual({ id: 123, first_name: 'Ivan', language_code: 'ru' });
    expect(tg.userId).toBe(123);
    expect(tg.languageCode).toBe('ru');
  });

  it('returns startParam correctly', async () => {
    const { tg } = await import('./telegram');
    expect(tg.startParam).toBe('ref123');
  });

  it('returns null and warns if user object is invalid', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.Telegram.WebApp.initDataUnsafe.user = { id: 'not-a-number' } as unknown as WebAppUser; // Invalid shape
    
    const { tg } = await import('./telegram');
    expect(tg.user).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('[TG] Invalid user data in initDataUnsafe:', { id: 'not-a-number' });
    
    warnSpy.mockRestore();
  });

  it('calls ready and expand without errors', async () => {
    const { tg } = await import('./telegram');
    tg.ready();
    expect(window.Telegram.WebApp.ready).toHaveBeenCalledOnce();
    
    tg.expand();
    expect(window.Telegram.WebApp.expand).toHaveBeenCalledOnce();
  });

  it('calls haptic feedback', async () => {
    const { tg } = await import('./telegram');
    tg.haptic('medium');
    expect(window.Telegram.WebApp.HapticFeedback.impactOccurred).toHaveBeenCalledWith('medium');
    
    tg.hapticNotification('success');
    expect(window.Telegram.WebApp.HapticFeedback.notificationOccurred).toHaveBeenCalledWith('success');
  });

  it('withHaptic wrapper calls haptic before executing function', async () => {
    const { withHaptic } = await import('./telegram');
    const mockFn = vi.fn();
    
    const wrapped = withHaptic(mockFn, 'heavy');
    wrapped('arg1', 'arg2');
    
    expect(window.Telegram.WebApp.HapticFeedback.impactOccurred).toHaveBeenCalledWith('heavy');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('showBackButton registers and returns cleanup function', async () => {
    const { tg } = await import('./telegram');
    const mockCb = vi.fn();
    
    const cleanup = tg.showBackButton(mockCb);
    
    expect(window.Telegram.WebApp.BackButton.show).toHaveBeenCalledOnce();
    expect(window.Telegram.WebApp.BackButton.onClick).toHaveBeenCalledWith(mockCb);
    
    cleanup?.();
    
    expect(window.Telegram.WebApp.BackButton.offClick).toHaveBeenCalledWith(mockCb);
    expect(window.Telegram.WebApp.BackButton.hide).toHaveBeenCalledOnce();
  });

  it('scanQr returns scanned text', async () => {
    const { tg } = await import('./telegram');
    
    const result = await tg.scanQr('Scan here');
    
    expect(window.Telegram.WebApp.showScanQrPopup).toHaveBeenCalledWith(
      { text: 'Scan here' },
      expect.any(Function)
    );
    expect(window.Telegram.WebApp.closeScanQrPopup).toHaveBeenCalledOnce();
    expect(result).toBe('test-qr-code');
  });
});
