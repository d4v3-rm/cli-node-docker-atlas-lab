import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Builds the Atlas Dashboard from the repository root while keeping
 * the app directory limited to source assets only.
 */
export default defineConfig({
  root: './apps/atlas-dashboard',
  plugins: [react()],
  build: {
    assetsDir: 'static',
    outDir: resolve(fileURLToPath(new URL('.', import.meta.url)), '.atlas-dashboard-dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }

          if (
            id.includes('react-markdown') ||
            id.includes('remark-gfm') ||
            id.includes('mdast') ||
            id.includes('micromark') ||
            id.includes('unist')
          ) {
            return 'markdown';
          }
          
          return undefined;
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/atlas-dashboard/src', import.meta.url))
    }
  }
});
