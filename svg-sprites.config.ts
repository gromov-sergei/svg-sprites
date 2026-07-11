import { defineLegacyConfig } from './src/index.js'

export default defineLegacyConfig({
  output: 'preview/public',
  preview: true,

  sprites: [
    {
      name: 'icons',
      input: 'test/assets/icons',
      format: 'stack',
    },
    {
      name: 'logos',
      input: 'test/assets/logos',
      format: 'stack',
    },
  ],
})
