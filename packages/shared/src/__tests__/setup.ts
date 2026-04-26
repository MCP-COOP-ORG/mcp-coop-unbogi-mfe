/**
 * Global test setup for @unbogi/shared.
 *
 * Mocks Firebase SDK modules so store/api tests run without
 * an actual Firebase project or network access.
 */
import { vi } from 'vitest';

// --- firebase/app ---
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

// --- firebase/app-check ---
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(),
}));

// --- firebase/auth ---
const mockAuth = {
  currentUser: null as unknown,
  signOut: vi.fn(() => Promise.resolve()),
};
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithCustomToken: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  onAuthStateChanged: vi.fn((_auth: unknown, _next: unknown) => vi.fn()),
  connectAuthEmulator: vi.fn(),
}));

// --- firebase/functions ---
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(),
  connectFunctionsEmulator: vi.fn(),
}));
