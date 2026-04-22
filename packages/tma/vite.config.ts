import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: process.env.VITE_APP_BASE || '/unbogi/',
  build: {
    outDir: process.env.VITE_APP_OUTDIR || 'dist/unbogi',
  },
  envPrefix: ['VITE_', 'UNBOGI_'],
  server: {
    port: 3090,
    allowedHosts: true,
  },
});
