import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Same-origin proxy for the UN Careers public API (its CORS preflight rejects JSON POSTs).
const unApiProxy = {
  '/un-api': {
    target: 'https://careers.un.org',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/un-api/, '/api'),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: unApiProxy },
  preview: { proxy: unApiProxy },
  // No manual chunks: the 3D scenes are lazy imports, so Rollup already keeps three.js and
  // R3F out of the entry. (Hand-splitting React created a circular chunk that broke production.)
  build: {
    chunkSizeWarningLimit: 1200,
  },
});
