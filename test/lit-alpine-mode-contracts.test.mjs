import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { generateSprite, isSpriteMode } from '../dist/index.js'

const CASES = [
  { mode: 'lit@vite', framework: 'lit', target: 'vite', folder: 'lit', runtime: 'lit-component.js' },
  { mode: 'lit@webpack', framework: 'lit', target: 'webpack', folder: 'lit', runtime: 'lit-component.js' },
  { mode: 'alpine@vite', framework: 'alpine', target: 'vite', folder: 'alpine', runtime: 'alpine-integration.js' },
  { mode: 'alpine@webpack', framework: 'alpine', target: 'webpack', folder: 'alpine', runtime: 'alpine-integration.js' },
]

test('keeps Lit and Alpine exact modes isolated', () => {
  for (const { mode } of CASES) {
    const modeDir = path.join(import.meta.dirname, '..', 'src', 'modes', mode.replace('@', '-'))
    const source = ['adapter.ts', 'output.ts']
      .map((file) => fs.readFileSync(path.join(modeDir, file), 'utf8'))
      .join('\n')

    assert.doesNotMatch(source, /from ['"][^'"]*\.\.\/(?:lit|alpine)-(?:vite|webpack)/)
    assert.match(source, new RegExp(`const MODE = '${mode}'|mode: '${mode}'`))
  }
})

test('generates isolated Lit and Alpine exact-mode contracts', async (t) => {
  for (const fixture of CASES) {
    await t.test(fixture.mode, async () => {
      const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), `svg-sprites-${fixture.framework}-`))
      const iconsDir = path.join(rootDir, 'icons')
      fs.mkdirSync(iconsDir)
      fs.writeFileSync(
        path.join(iconsDir, 'check.svg'),
        '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
      )

      assert.equal(isSpriteMode(fixture.mode), true)
      const result = await generateSprite(rootDir, {
        mode: fixture.mode,
        name: 'app',
        generatedNotice: false,
      })
      const generatedDir = path.join(rootDir, '.svg-sprite')
      const runtimePath = path.join(generatedDir, fixture.folder, fixture.runtime)
      const runtime = fs.readFileSync(runtimePath, 'utf8')
      const runtimeTypes = fs.readFileSync(runtimePath.replace(/\.js$/, '.d.ts'), 'utf8')
      const manifest = fs.readFileSync(result.manifestPath, 'utf8')
      const manifestTypes = fs.readFileSync(path.join(generatedDir, 'svg-sprite.manifest.d.ts'), 'utf8')

      assert.equal(result.mode, fixture.mode)
      assert.equal(result.target, fixture.target)
      assert.equal(result.iconCount, 1)
      assert.deepEqual(fs.readdirSync(path.join(generatedDir, fixture.folder)).sort(), [
        `${fixture.runtime.replace(/\.js$/, '')}.css`,
        `${fixture.runtime.replace(/\.js$/, '')}.d.ts`,
        fixture.runtime,
      ])
      assert.match(manifest, new RegExp(`"framework": "${fixture.framework}"`))
      assert.match(manifest, new RegExp(`"mode": "${fixture.mode}"`))
      assert.match(manifestTypes, new RegExp(`mode: '${fixture.mode}'`))

      if (fixture.framework === 'lit') {
        assert.match(runtime, /import \{ LitElement, html, nothing, unsafeCSS \} from 'lit'/)
        assert.match(runtime, /export class AppIcon extends LitElement/)
        assert.match(runtime, /export function defineAppIcon\(\)/)
        assert.match(runtimeTypes, /export declare class AppIcon extends LitElement/)
        assert.match(runtimeTypes, /"app-icon": AppIcon/)
        assert.match(manifest, /"componentName": "AppIcon"/)
      } else {
        assert.match(runtime, /export const appAlpinePlugin = \(Alpine\) =>/)
        assert.match(runtime, /Alpine\.directive\(appIconDirective/)
        assert.match(runtime, /Alpine\.magic\(appIconMagic/)
        assert.doesNotMatch(runtime, /customElements|extends HTMLElement|LitElement/)
        assert.match(runtimeTypes, /export type AppAlpineApi/)
        assert.match(runtimeTypes, /export declare const appAlpinePlugin: AppAlpinePluginType/)
        assert.doesNotMatch(runtimeTypes, /from ['"]alpinejs['"]|import\(['"]alpinejs['"]\)/)
      }

      if (fixture.target === 'vite') {
        assert.match(runtime, /sprite\.svg\?no-inline/)
        assert.match(manifest, /sprite\.svg\?no-inline/)
      } else {
        assert.match(runtime, /new URL\('\.\.\/sprite\.svg', import\.meta\.url\)\.href/)
        assert.match(manifest, /new URL\('\.\/sprite\.svg', import\.meta\.url\)\.href/)
      }
    })
  }
})
