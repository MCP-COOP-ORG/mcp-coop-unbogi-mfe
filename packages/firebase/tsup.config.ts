import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  dts: false,
  sourcemap: false,
  // Bundle @unbogi/* packages inline — they won't exist in Cloud Run
  noExternal: [/@unbogi\/.*/],
  // All runtime deps available in Cloud Run via npm install
  external: [
    /^firebase-admin/,
    /^firebase-functions/,
    'resend',
    'zod',
  ],
});
