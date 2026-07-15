import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { generateSprite, isSpriteMode } from '../dist/index.js'

const MODES = [
  { mode: 'preact@vite', target: 'vite', asset: /sprite\.svg\?no-inline/ },
  { mode: 'preact@webpack', target: 'webpack', asset: /new URL\('\.\.\/sprite\.svg', import\.meta\.url\)\.href/ },
]

function fixture() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-preact-'))
  fs.mkdirSync(path.join(rootDir, 'icons'))
  fs.writeFileSync(
    path.join(rootDir, 'icons', 'check.svg'),
    '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
  )
  return rootDir
}

test('generates every isolated Preact family contract', async () => {
  for (const contract of MODES) {
    assert.equal(isSpriteMode(contract.mode), true)
    const result = await generateSprite(fixture(), {
      mode: contract.mode,
      name: 'app-icons',
      generatedNotice: false,
    })
    const component = fs.readFileSync(path.join(result.generatedDir, 'preact', 'preact-component.js'), 'utf8')
    const componentTypes = fs.readFileSync(path.join(result.generatedDir, 'preact', 'preact-component.d.ts'), 'utf8')
    const manifest = fs.readFileSync(result.manifestPath, 'utf8')

    assert.equal(result.mode, contract.mode)
    assert.equal(result.target, contract.target)
    assert.deepEqual(fs.readdirSync(path.join(result.generatedDir, 'preact')).sort(), [
      'preact-component.d.ts',
      'preact-component.js',
      'preact-component.module.css',
    ])
    assert.match(component, /import \{ h \} from 'preact'/)
    assert.match(component, /export const AppIconsIcon/)
    assert.match(component, contract.asset)
    assert.match(componentTypes, /FunctionalComponent<AppIconsIconProps>/)
    assert.match(manifest, /"framework": "preact"/)
    assert.match(manifest, new RegExp(`"mode": ${JSON.stringify(contract.mode)}`))
    assert.doesNotMatch(component, /customElements|HTMLElement|gromlab-sprite-viewer/)
    assert.equal(fs.existsSync(path.join(result.generatedDir, 'preact', 'preact-component.tsx')), false)
  }
})
