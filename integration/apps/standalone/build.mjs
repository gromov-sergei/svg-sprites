import fs from 'node:fs'

fs.rmSync(new URL('./dist/', import.meta.url), { recursive: true, force: true })
fs.mkdirSync(new URL('./dist/', import.meta.url), { recursive: true })
fs.copyFileSync(new URL('./index.html', import.meta.url), new URL('./dist/index.html', import.meta.url))
fs.copyFileSync(
  new URL('../../../dist/viewer-element.js', import.meta.url),
  new URL('./dist/viewer-element.js', import.meta.url),
)

for (const root of ['app-icons', 'remote-app-icons']) {
  fs.mkdirSync(new URL(`./dist/${root}/`, import.meta.url), { recursive: true })
  fs.copyFileSync(
    new URL(`./src/${root}/.svg-sprite/sprite.svg`, import.meta.url),
    new URL(`./dist/${root}/sprite.svg`, import.meta.url),
  )
  fs.copyFileSync(
    new URL(`./src/${root}/.svg-sprite/svg-sprite.manifest.json`, import.meta.url),
    new URL(`./dist/${root}/manifest.json`, import.meta.url),
  )
}
