const sourceOrigin = process.env.SVG_SPRITE_SOURCE_ORIGIN
const sourceSha256 = process.env.SVG_SPRITE_SOURCE_SHA256

if (!sourceOrigin || !sourceSha256) throw new Error('HTTP source origin and SHA-256 are required.')

export default {
  mode: 'standalone@server',
  name: 'remote-http',
  input: [
    {
      name: 'folder open',
      url: `${sourceOrigin}/sources/check.svg`,
      sha256: sourceSha256,
    },
  ],
  generatedNotice: false,
}
