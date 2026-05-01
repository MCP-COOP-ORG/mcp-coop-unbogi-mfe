import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id' } })),
    signOut: jest.fn(() => Promise.resolve()),
    revokeAccess: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('@shopify/react-native-skia', () => ({
  Canvas: 'Canvas',
  Circle: 'Circle',
  Group: 'Group',
  Path: 'Path',
  Skia: {
    Paint: jest.fn().mockReturnValue({}),
    Path: {
      Make: jest.fn().mockReturnValue({}),
    },
  },
  useImage: jest.fn(),
  useCanvasRef: jest.fn().mockReturnValue({ current: null }),
}));

// Warm up Expo WinterCG shims to prevent "ReferenceError: You are trying to import a file outside of the scope"
try {
  global.structuredClone;
  global.fetch;
  global.URL;
  global.URLSearchParams;
  global.Headers;
  global.Request;
  global.Response;
  global.__ExpoImportMetaRegistry;
} catch (e) {}
