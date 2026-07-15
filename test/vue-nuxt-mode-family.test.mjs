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

const MODES = [
  {
    mode: 'vue@webpack',
    target: 'webpack',
    componentAsset: /new URL\('\.\.\/sprite\.svg', import\.meta\.url\)\.href/,
    manifestAsset: /new URL\('\.\/sprite\.svg', import\.meta\.url\)\.href/,
  },
  {
    mode: 'nuxt@vite',
    target: 'vite',
    componentAsset: /sprite\.svg\?no-inline/,
    manifestAsset: /sprite\.svg\?no-inline/,
  },
  {
    mode: 'nuxt@webpack',
    target: 'webpack',
    componentAsset: /import spriteUrl from '\.\.\/sprite\.svg'/,
    manifestAsset: /import spriteUrl from '\.\/sprite\.svg'/,
  },
]

test('generates isolated Vue-family contracts for Vue Webpack and Nuxt', async () => {
  for (const contract of MODES) {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), `svg-sprites-${contract.mode.replace('@', '-')}-`))
    const iconsDir = path.join(rootDir, 'icons')
    fs.mkdirSync(iconsDir)
    fs.writeFileSync(
      path.join(iconsDir, 'check.svg'),
      '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
    )

    assert.equal(isSpriteMode(contract.mode), true)
    const result = await generateSprite(rootDir, {
      mode: contract.mode,
      name: 'app',
      generatedNotice: false,
    })
    const generatedDir = path.join(rootDir, '.svg-sprite')
    const component = fs.readFileSync(path.join(generatedDir, 'vue', 'vue-component.js'), 'utf8')
    const componentTypes = fs.readFileSync(path.join(generatedDir, 'vue', 'vue-component.d.ts'), 'utf8')
    const manifest = fs.readFileSync(result.manifestPath, 'utf8')
    const manifestTypes = fs.readFileSync(path.join(generatedDir, 'svg-sprite.manifest.d.ts'), 'utf8')

    assert.equal(result.mode, contract.mode)
    assert.equal(result.target, contract.target)
    assert.deepEqual(fs.readdirSync(generatedDir).sort(), GENERATED_FILES)
    assert.deepEqual(fs.readdirSync(path.join(generatedDir, 'vue')).sort(), [
      'vue-component.d.ts',
      'vue-component.js',
      'vue-component.module.css',
    ])
    assert.match(component, /import \{ defineComponent, h \} from 'vue'/)
    assert.match(component, /export const AppIcon = defineComponent/)
    assert.match(component, contract.componentAsset)
    assert.match(componentTypes, /DefineComponent<AppIconProps>/)
    assert.match(componentTypes, /--icon-color-/)
    assert.match(manifest, /"framework": "vue"/)
    assert.match(manifest, /"componentName": "AppIcon"/)
    assert.match(manifest, new RegExp(`"mode": ${JSON.stringify(contract.mode)}`))
    assert.match(manifest, contract.manifestAsset)
    assert.match(manifestTypes, new RegExp(`mode: ${JSON.stringify(contract.mode).replaceAll('"', "'")}`))
    assert.doesNotMatch(component, /\b(?:window|document|customElements|HTMLElement)\b/)
    assert.doesNotMatch(manifest, /\b(?:window|document|customElements|HTMLElement)\b/)
    assert.doesNotMatch(component, /from '@gromlab\/svg-sprites/)
  }
})
