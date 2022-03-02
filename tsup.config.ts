import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node14', // vitest supports vitest 14+
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true
})
