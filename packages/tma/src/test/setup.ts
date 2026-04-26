import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub Firebase environment variables for tests to prevent initialization errors
vi.stubEnv('UNBOGI_FIREBASE_API_KEY', 'fake-key');
vi.stubEnv('UNBOGI_FIREBASE_AUTH_DOMAIN', 'fake-auth-domain');
vi.stubEnv('UNBOGI_FIREBASE_PROJECT_ID', 'fake-project-id');
vi.stubEnv('UNBOGI_FIREBASE_STORAGE_BUCKET', 'fake-storage-bucket');
vi.stubEnv('UNBOGI_FIREBASE_MESSAGING_SENDER_ID', 'fake-sender-id');
vi.stubEnv('UNBOGI_FIREBASE_APP_ID', 'fake-app-id');
vi.stubEnv('UNBOGI_USE_FIREBASE_EMULATOR', 'false');

// Mock matchMedia if not present in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Telegram WebApp SDK
const MockTelegramWebApp = {
  initData: 'query_id=mock_query_id',
  initDataUnsafe: {
    user: {
      id: 12345,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'en',
    },
  },
  themeParams: {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#2481cc',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
  },
  isExpanded: false,
  viewportHeight: 600,
  viewportStableHeight: 600,
  ready: vi.fn(),
  expand: vi.fn(),
  close: vi.fn(),
  MainButton: {
    text: 'CONTINUE',
    color: '#2481cc',
    textColor: '#ffffff',
    isVisible: false,
    isActive: true,
    isProgressVisible: false,
    setText: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    showProgress: vi.fn(),
    hideProgress: vi.fn(),
    setParams: vi.fn(),
  },
  HapticFeedback: {
    impactOccurred: vi.fn(),
    notificationOccurred: vi.fn(),
    selectionChanged: vi.fn(),
  },
  sendData: vi.fn(),
  showPopup: vi.fn(),
  showAlert: vi.fn(),
  showConfirm: vi.fn(),
  onEvent: vi.fn(),
  offEvent: vi.fn(),
};

vi.stubGlobal('Telegram', { WebApp: MockTelegramWebApp });

// Mock Framer Motion to prevent animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    // Provide a simple wrapper for AnimatePresence to render children instantly
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    // Replace motion components with their basic HTML counterparts if needed,
    // or just let them render immediately
  };
});
