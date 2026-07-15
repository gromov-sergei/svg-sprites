import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { generateSprite, isSpriteMode } from '../dist/index.js'

test('generates an isolated SSR-safe Qwik Vite contract', async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-qwik-'))
  fs.mkdirSync(path.join(rootDir, 'icons'))
  fs.writeFileSync(
    path.join(rootDir, 'icons', 'check.svg'),
    '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
  )

  assert.equal(isSpriteMode('qwik@vite'), true)
  const result = await generateSprite(rootDir, {
    mode: 'qwik@vite',
    name: 'app-icons',
    generatedNotice: false,
  })
  const component = fs.readFileSync(path.join(result.generatedDir, 'qwik', 'qwik-component.jsx'), 'utf8')
  const componentTypes = fs.readFileSync(path.join(result.generatedDir, 'qwik', 'qwik-component.d.ts'), 'utf8')
  const manifest = fs.readFileSync(result.manifestPath, 'utf8')

  assert.equal(result.mode, 'qwik@vite')
  assert.equal(result.target, 'vite')
  assert.deepEqual(fs.readdirSync(path.join(result.generatedDir, 'qwik')).sort(), [
    'qwik-component.d.ts',
    'qwik-component.jsx',
    'qwik-component.module.css',
  ])
  assert.match(component, /import \{ component\$ \} from '@builder\.io\/qwik'/)
  assert.match(component, /sprite\.svg\?no-inline/)
  assert.match(component, /export const AppIconsIcon = component\$/)
  assert.match(componentTypes, /Component<AppIconsIconProps>/)
  assert.match(manifest, /"framework": "qwik"/)
  assert.match(manifest, /"ssr": true/)
  assert.match(manifest, /"mode": "qwik@vite"/)
  assert.doesNotMatch(component, /\b(?:window|document|navigator|customElements|HTMLElement)\b/)
  assert.equal(fs.existsSync(path.join(result.generatedDir, 'qwik', 'qwik-component.tsx')), false)
})
