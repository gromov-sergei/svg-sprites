import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { generateSprite, isSpriteMode } from '../dist/index.js'

const GENERATED_FILES = [
  'icon-data.d.ts',
  'icon-data.js',
  'index.d.ts',
  'index.js',
  'sprite.svg',
  'svg-sprite.manifest.d.ts',
  'svg-sprite.manifest.js',
  'vue',
]

test('generates the isolated Vue Vite contract', async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-vue-vite-'))
  const iconsDir = path.join(rootDir, 'icons')
  fs.mkdirSync(iconsDir)
  fs.writeFileSync(
    path.join(iconsDir, 'check.svg'),
    '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
  )

  assert.equal(isSpriteMode('vue@vite'), true)
  const result = await generateSprite(rootDir, {
    mode: 'vue@vite',
    name: 'app',
    generatedNotice: false,
  })
  const generatedDir = path.join(rootDir, '.svg-sprite')

  assert.equal(result.mode, 'vue@vite')
  assert.equal(result.target, 'vite')
  assert.equal(result.iconCount, 1)
  assert.deepEqual(fs.readdirSync(generatedDir).sort(), GENERATED_FILES)
  assert.deepEqual(fs.readdirSync(path.join(generatedDir, 'vue')).sort(), [
    'vue-component.d.ts',
    'vue-component.js',
    'vue-component.module.css',
  ])

  const component = fs.readFileSync(path.join(generatedDir, 'vue', 'vue-component.js'), 'utf8')
  const componentTypes = fs.readFileSync(path.join(generatedDir, 'vue', 'vue-component.d.ts'), 'utf8')
  const manifest = fs.readFileSync(result.manifestPath, 'utf8')
  const manifestTypes = fs.readFileSync(path.join(generatedDir, 'svg-sprite.manifest.d.ts'), 'utf8')

  assert.match(component, /import \{ defineComponent, h \} from 'vue'/)
  assert.match(component, /export const AppIcon = defineComponent/)
  assert.match(component, /sprite\.svg\?no-inline/)
  assert.match(componentTypes, /DefineComponent<AppIconProps>/)
  assert.match(componentTypes, /--icon-color-/)
  assert.match(manifest, /"framework": "vue"/)
  assert.match(manifest, /"componentName": "AppIcon"/)
  assert.match(manifest, /"mode": "vue@vite"/)
  assert.match(manifestTypes, /mode: 'vue@vite'/)
  assert.doesNotMatch(component, /from '@gromlab\/svg-sprites/)
})
