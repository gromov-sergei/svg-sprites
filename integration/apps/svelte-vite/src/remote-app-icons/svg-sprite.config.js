export default {
  mode: 'svelte@vite',
  source: 'remote',
  // @ts-ignore The config runs in Node, while the app typecheck only includes browser globals.
  input: process.env.SVG_SPRITE_REMOTE_MANIFEST_URL
    ?? '../../../standalone-server/cases/mixed-input/.svg-sprite/svg-sprite.manifest.json',
}
