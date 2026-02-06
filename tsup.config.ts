import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'bin/lab-atlas': 'src/bin/lab-atlas.ts'
  },
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  target: 'node20',
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node'
  }
});
