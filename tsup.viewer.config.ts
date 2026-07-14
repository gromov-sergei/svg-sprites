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
  target: 'node18',
  noExternal: ['lit', 'vanilla-colorful'],
})
