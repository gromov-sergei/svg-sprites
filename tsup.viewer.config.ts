import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'viewer-element': 'src/viewer-element.ts',
  },
  format: 'esm',
  dts: true,
  clean: false,
  splitting: false,
  sourcemap: true,
  target: 'es2022',
  platform: 'browser',
  noExternal: ['lit', 'vanilla-colorful'],
})
