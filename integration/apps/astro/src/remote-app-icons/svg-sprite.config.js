const manifestUrl = process.env.SVG_SPRITE_REMOTE_MANIFEST_URL
  ?? '../../../standalone-server/cases/mixed-input/.svg-sprite/svg-sprite.manifest.json'

export default {
  mode: 'astro@vite',
  source: 'remote',
  input: manifestUrl,
}
