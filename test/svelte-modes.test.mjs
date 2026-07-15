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
  'svelte',
  'svg-sprite.manifest.d.ts',
  'svg-sprite.manifest.js',
]

test('generates isolated native Svelte contracts for every Svelte exact mode', async () => {
  const modes = [
    { mode: 'svelte@vite', target: 'vite', url: /sprite\.svg\?no-inline/ },
    { mode: 'svelte@webpack', target: 'webpack', url: /new URL\('\.\.\/sprite\.svg', import\.meta\.url\)\.href/ },
    { mode: 'sveltekit@vite', target: 'vite', url: /sprite\.svg\?no-inline/ },
  ]

  for (const expected of modes) {
    assert.equal(isSpriteMode(expected.mode), true)
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-svelte-'))
    const iconsDir = path.join(rootDir, 'icons')
    fs.mkdirSync(iconsDir)
    fs.writeFileSync(
      path.join(iconsDir, 'check.svg'),
      '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
    )

    const result = await generateSprite(rootDir, {
      mode: expected.mode,
      name: 'app',
      generatedNotice: false,
    })
    const generatedDir = path.join(rootDir, '.svg-sprite')
    const component = fs.readFileSync(path.join(generatedDir, 'svelte', 'svelte-component.svelte'), 'utf8')
    const componentTypes = fs.readFileSync(path.join(generatedDir, 'svelte', 'svelte-component.svelte.d.ts'), 'utf8')
    const manifest = fs.readFileSync(result.manifestPath, 'utf8')
    const manifestTypes = fs.readFileSync(path.join(generatedDir, 'svg-sprite.manifest.d.ts'), 'utf8')

    assert.equal(result.mode, expected.mode)
    assert.equal(result.target, expected.target)
    assert.equal(result.iconCount, 1)
    assert.deepEqual(fs.readdirSync(generatedDir).sort(), GENERATED_FILES)
    assert.deepEqual(fs.readdirSync(path.join(generatedDir, 'svelte')).sort(), [
      'svelte-component.svelte',
      'svelte-component.svelte.d.ts',
    ])
    assert.match(component, /<script>/)
    assert.match(component, /\$props\(\)/)
    assert.match(component, expected.url)
    assert.doesNotMatch(component, /lang=["']ts["']/)
    assert.doesNotMatch(component, /window|document|customElements/)
    assert.match(componentTypes, /Component<AppIconProps>/)
    assert.match(componentTypes, /SVGAttributes<SVGSVGElement>/)
    assert.match(manifest, /"framework": "svelte"/)
    assert.match(manifest, /"componentName": "AppIcon"/)
    assert.match(manifest, new RegExp(`"mode": ${JSON.stringify(expected.mode)}`))
    assert.match(manifestTypes, new RegExp(`mode: ${JSON.stringify(expected.mode).replaceAll('"', "'")}`))
    assert.doesNotMatch(component, /from ['"].*modes\//)
  }
})
