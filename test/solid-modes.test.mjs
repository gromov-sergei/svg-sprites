import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { generateSprite, isSpriteMode } from '../dist/index.js'

const MODES = [
  { mode: 'solid@vite', target: 'vite', asset: /sprite\.svg\?no-inline/ },
  { mode: 'solid@webpack', target: 'webpack', asset: /new URL\('\.\.\/sprite\.svg', import\.meta\.url\)\.href/ },
  { mode: 'solid-start@vite', target: 'vite', asset: /sprite\.svg\?no-inline/, ssr: true },
]

function fixture() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-solid-'))
  fs.mkdirSync(path.join(rootDir, 'icons'))
  fs.writeFileSync(
    path.join(rootDir, 'icons', 'check.svg'),
    '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
  )
  return rootDir
}

test('generates every isolated Solid family contract', async () => {
  for (const contract of MODES) {
    assert.equal(isSpriteMode(contract.mode), true)
    const result = await generateSprite(fixture(), {
      mode: contract.mode,
      name: 'app-icons',
      generatedNotice: false,
    })
    const componentPath = path.join(result.generatedDir, 'solid', 'solid-component.jsx')
    const component = fs.readFileSync(componentPath, 'utf8')
    const componentTypes = fs.readFileSync(path.join(result.generatedDir, 'solid', 'solid-component.d.ts'), 'utf8')
    const manifest = fs.readFileSync(result.manifestPath, 'utf8')

    assert.equal(result.mode, contract.mode)
    assert.equal(result.target, contract.target)
    assert.deepEqual(fs.readdirSync(path.join(result.generatedDir, 'solid')).sort(), [
      'solid-component.d.ts',
      'solid-component.jsx',
      'solid-component.module.css',
    ])
    assert.match(component, /import \{ Show, splitProps \} from 'solid-js'/)
    assert.match(component, /export const AppIconsIcon/)
    assert.match(component, contract.asset)
    assert.match(componentTypes, /Component<AppIconsIconProps>/)
    assert.match(manifest, /"framework": "solid(?:-start)?"/)
    assert.match(manifest, new RegExp(`"mode": ${JSON.stringify(contract.mode)}`))
    assert.doesNotMatch(component, /customElements|HTMLElement|gromlab-sprite-viewer/)
    assert.equal(fs.existsSync(path.join(result.generatedDir, 'solid', 'solid-component.tsx')), false)

    if (contract.ssr) {
      assert.match(manifest, /"ssr": true/)
      assert.doesNotMatch(component, /\b(?:window|document|navigator|customElements)\b/)
    }
  }
})
