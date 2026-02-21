import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Builds the Atlas Lab graphical index from the repository root while keeping
 * the app directory limited to source assets only.
 */
export default defineConfig({
  root: './apps/lab-index',
  plugins: [react()],
  build: {
    assetsDir: 'static',
    outDir: resolve(fileURLToPath(new URL('.', import.meta.url)), '.lab-index-dist'),
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/lab-index/src', import.meta.url))
    }
  }
});
