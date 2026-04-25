import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run all test files except integration tests
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.integration.test.ts', 'node_modules', 'dist'],
    globals: true,
    environment: 'node',
    // We mock external dependencies globally for unit tests if needed
    coverage: {
      provider: 'v8',
      include: ['src/services/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['src/handlers/**', 'src/repositories/**', '**/*.test.ts', '**/*.integration.test.ts', '**/index.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      reporter: ['text', 'json', 'html'],
    },
  },
});
