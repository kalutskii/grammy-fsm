import { defineConfig } from 'tsup';

const tsupConfig = defineConfig({
  outDir: 'dist',
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  sourcemap: true,
  dts: true,
  clean: true,
  splitting: false,
});

export default tsupConfig;
