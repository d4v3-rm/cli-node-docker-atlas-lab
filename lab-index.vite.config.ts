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
      '@': fileURLToPath(new URL('./apps/lab-index/src', import.meta.url))
    }
  }
});
