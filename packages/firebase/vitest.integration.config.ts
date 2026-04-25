import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run integration test files
    include: ['src/**/*.integration.test.ts'],
    globals: true,
    environment: 'node',
    // Global setup hook to start the emulator container
    globalSetup: ['./src/__tests__/globalSetup.integration.ts'],
    // Setup file to run before all integration tests (e.g. to clear the emulator DB)
    setupFiles: ['./src/__tests__/setup.integration.ts'],
    // Integration tests with the emulator can sometimes take a bit longer to start
    testTimeout: 10000,
    hookTimeout: 30000, // extra time for downloading docker images
  },
});
