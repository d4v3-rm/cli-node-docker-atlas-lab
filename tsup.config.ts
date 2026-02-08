import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'bin/atlas-lab': 'src/bin/atlas-lab.ts'
  },
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  target: 'node20',
  outDir: 'dist'
});
