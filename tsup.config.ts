import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node14.16', // vitest supports vitest 14.16.0+
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true
})
