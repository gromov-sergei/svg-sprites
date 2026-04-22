import { defineConfig } from './src/index.js'

export default defineConfig({
  output: 'preview/public',
  publicPath: '',
  preview: true,
  react: 'test/ui/svg-sprite',

  sprites: [
    {
      name: 'icons',
      input: 'test/assets/icons',
      mode: 'stack',
    },
    {
      name: 'logos',
      input: 'test/assets/logos',
      mode: 'stack',
    },
  ],
})
