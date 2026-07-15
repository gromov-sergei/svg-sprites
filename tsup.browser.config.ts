import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    react: 'src/react.ts',
    viewer: 'src/viewer.ts',
  },
  format: 'esm',
  dts: true,
  clean: false,
  sourcemap: true,
  target: 'es2022',
  platform: 'browser',
})
