export default {
  mode: 'vue@webpack',
  source: 'remote',
  input: process.env.SVG_SPRITE_REMOTE_MANIFEST_URL
    ?? '../../../standalone-server/cases/mixed-input/.svg-sprite/svg-sprite.manifest.json',
}
