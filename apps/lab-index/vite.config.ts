import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Builds the Atlas Lab graphical index as a static bundle served by the gateway image.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'static',
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
