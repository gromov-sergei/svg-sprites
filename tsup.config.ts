import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: 'esm',
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  banner: ({ format }) => {
    // cli.js needs a shebang for npx/bin usage
    return {}
  },
})
