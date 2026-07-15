import fs from 'node:fs'

fs.rmSync(new URL('./dist/', import.meta.url), { recursive: true, force: true })
fs.mkdirSync(new URL('./dist/app-icons/', import.meta.url), { recursive: true })
fs.copyFileSync(new URL('./index.html', import.meta.url), new URL('./dist/index.html', import.meta.url))
fs.copyFileSync(
  new URL('../../../dist/viewer-element.js', import.meta.url),
  new URL('./dist/viewer-element.js', import.meta.url),
)
fs.copyFileSync(
  new URL('./src/sprite/.svg-sprite/sprite.svg', import.meta.url),
  new URL('./dist/app-icons/sprite.svg', import.meta.url),
)
fs.copyFileSync(
  new URL('./src/sprite/.svg-sprite/svg-sprite.manifest.json', import.meta.url),
  new URL('./dist/app-icons/manifest.json', import.meta.url),
)
