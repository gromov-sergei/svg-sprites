const sourceOrigin = process.env.SVG_SPRITE_SOURCE_ORIGIN

if (!sourceOrigin) throw new Error('SVG_SPRITE_SOURCE_ORIGIN is required.')

export default {
  mode: 'standalone@server',
  name: 'remote-app',
  input: [
    '../../../../fixtures/icons/duotone.svg',
    { name: 'check', url: `${sourceOrigin}/sources/check.svg` },
  ],
  generatedNotice: false,
}
