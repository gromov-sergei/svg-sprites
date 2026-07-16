import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const casesRoot = path.join(import.meta.dirname, 'cases')

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function verifyCase(caseName, expected) {
  const outputDir = path.join(casesRoot, caseName, '.svg-sprite')
  const manifestPath = path.join(outputDir, 'svg-sprite.manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  assert.equal(manifest.kind, '@gromlab/svg-sprites/server')
  assert.equal(manifest.mode, 'standalone@server')
  assert.equal(manifest.target, 'server')
  assert.equal(manifest.name, expected.name)
  assert.equal(manifest.iconCount, expected.icons.length)
  assert.deepEqual(manifest.icons.map(({ name }) => name), expected.icons)
  assert.deepEqual(manifest.transform, expected.transform)

  for (const profile of ['stack', 'stack-root-viewbox']) {
    const asset = manifest.sprites[profile]
    const filePath = path.resolve(outputDir, asset.href)
    const bytes = fs.readFileSync(filePath)
    assert.equal(bytes.byteLength, asset.byteLength)
    assert.equal(sha256(bytes), asset.sha256)
    assert.match(path.basename(filePath), new RegExp(`^sprite${profile === 'stack' ? '' : '-root-viewbox'}\\.[a-f0-9]{16}\\.svg$`))
  }

  assert.deepEqual(fs.readdirSync(outputDir).sort().length, 3)
  assert.equal(fs.existsSync(path.join(outputDir, 'index.js')), false)
  assert.equal(fs.existsSync(path.join(path.dirname(outputDir), '.gitignore')), false)
  return manifest
}

const defaults = { removeSize: true, replaceColors: true, addTransition: true }
verifyCase('mixed-input', {
  name: 'remote-app',
  icons: ['check', 'duotone'],
  transform: defaults,
})
const httpManifest = verifyCase('http-only', {
  name: 'remote-http',
  icons: ['folder open'],
  transform: defaults,
})
assert.match(httpManifest.icons[0].id, /^icon-[a-f0-9]{16}$/)
const plainManifest = verifyCase('transforms-disabled', {
  name: 'remote-plain',
  icons: ['duotone'],
  transform: { removeSize: false, replaceColors: false, addTransition: false },
})
assert.equal(plainManifest.icons[0].colors.length, 0)

console.log('Verified standalone@server integration cases.')
