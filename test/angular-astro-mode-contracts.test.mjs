import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)

const [
  { angularApplicationAdapter },
  { angularWebpackAdapter },
  { astroViteAdapter },
] = await Promise.all([
  jiti.import('../src/modes/angular-application/adapter.ts'),
  jiti.import('../src/modes/angular-webpack/adapter.ts'),
  jiti.import('../src/modes/astro-vite/adapter.ts'),
])

function createContext(mode) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-framework-family-'))
  const iconsDir = path.join(rootDir, 'icons')
  const iconPath = path.join(iconsDir, 'check.svg')
  fs.mkdirSync(iconsDir)
  fs.writeFileSync(
    iconPath,
    '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M2 12l6 6L22 4" /></svg>',
  )

  return {
    rootDir,
    config: {
      mode,
      name: 'app',
      description: 'Application icons',
      input: [iconsDir],
      transform: {
        removeSize: true,
        replaceColors: true,
        addTransition: true,
      },
      generatedNotice: false,
    },
    prepared: {
      folder: {
        name: 'app',
        format: 'stack',
        path: iconsDir,
        files: [iconPath],
      },
      iconNames: ['check'],
    },
  }
}

function filesByPath(plan) {
  return new Map(plan.files.map((file) => [file.path, String(file.content)]))
}

test('Angular application adapter emits a standalone component for the application builder', async () => {
  const plan = await angularApplicationAdapter.generate(createContext('angular@application'))
  const files = filesByPath(plan)

  assert.equal(angularApplicationAdapter.mode, 'angular@application')
  assert.equal(plan.result.target, 'application')
  assert.equal(plan.paths.entry, '.svg-sprite/index.ts')
  assert.deepEqual([...files.keys()].sort(), [
    '.svg-sprite/angular/angular-component.css',
    '.svg-sprite/angular/angular-component.d.ts',
    '.svg-sprite/angular/angular-component.ts',
    '.svg-sprite/assets.d.ts',
    '.svg-sprite/icon-data.d.ts',
    '.svg-sprite/icon-data.js',
    '.svg-sprite/index.d.ts',
    '.svg-sprite/index.ts',
    '.svg-sprite/sprite.svg',
    '.svg-sprite/svg-sprite.manifest.d.ts',
    '.svg-sprite/svg-sprite.manifest.js',
  ])

  const component = files.get('.svg-sprite/angular/angular-component.ts')
  const declarations = files.get('.svg-sprite/angular/angular-component.d.ts')
  const manifest = files.get('.svg-sprite/svg-sprite.manifest.js')
  assert.match(component, /@Component\(\{/)
  assert.match(component, /standalone: true/)
  assert.match(component, /export class AppIcon/)
  assert.match(component, /input\.required<AppIconName>\(\)/)
  assert.match(component, /reference path="\.\.\/assets\.d\.ts"/)
  assert.match(component, /import spriteUrl from '\.\.\/sprite\.svg'/)
  assert.match(declarations, /InputSignal<AppIconName>/)
  assert.match(declarations, /ɵɵComponentDeclaration/)
  assert.match(manifest, /import spriteUrl from '\.\/sprite\.svg'/)
  assert.match(manifest, /"mode": "angular@application"/)
  assert.match(manifest, /"framework": "angular"/)
  assert.doesNotMatch(component, /customElements|HTMLElement|attachShadow/)
})

test('Angular Webpack adapter owns its Webpack asset contract', async () => {
  const plan = await angularWebpackAdapter.generate(createContext('angular@webpack'))
  const files = filesByPath(plan)
  const component = files.get('.svg-sprite/angular/angular-component.ts')
  const manifest = files.get('.svg-sprite/svg-sprite.manifest.js')

  assert.equal(angularWebpackAdapter.mode, 'angular@webpack')
  assert.equal(plan.result.target, 'webpack')
  assert.equal(files.has('.svg-sprite/assets.d.ts'), false)
  assert.match(component, /new URL\('\.\.\/sprite\.svg', import\.meta\.url\)\.href/)
  assert.match(manifest, /new URL\('\.\/sprite\.svg', import\.meta\.url\)\.href/)
  assert.match(manifest, /"mode": "angular@webpack"/)
  assert.doesNotMatch(component, /customElements|HTMLElement|attachShadow/)
})

test('Astro Vite adapter emits an Astro component with JavaScript frontmatter', async () => {
  const plan = await astroViteAdapter.generate(createContext('astro@vite'))
  const files = filesByPath(plan)

  assert.equal(astroViteAdapter.mode, 'astro@vite')
  assert.equal(plan.result.target, 'vite')
  assert.equal(plan.paths.entry, '.svg-sprite/index.js')
  assert.deepEqual([...files.keys()].sort(), [
    '.svg-sprite/astro/astro-component.astro',
    '.svg-sprite/astro/astro-component.astro.d.ts',
    '.svg-sprite/astro/astro-component.css',
    '.svg-sprite/icon-data.d.ts',
    '.svg-sprite/icon-data.js',
    '.svg-sprite/index.d.ts',
    '.svg-sprite/index.js',
    '.svg-sprite/sprite.svg',
    '.svg-sprite/svg-sprite.manifest.d.ts',
    '.svg-sprite/svg-sprite.manifest.js',
  ])

  const component = files.get('.svg-sprite/astro/astro-component.astro')
  const declarations = files.get('.svg-sprite/astro/astro-component.astro.d.ts')
  const manifest = files.get('.svg-sprite/svg-sprite.manifest.js')
  assert.match(component, /^---\n/)
  assert.match(component, /sprite\.svg\?no-inline/)
  assert.match(component, /Astro\.props/)
  assert.doesNotMatch(component, /lang=["']ts|interface Props|customElements|HTMLElement|attachShadow/)
  assert.match(declarations, /HTMLAttributes<'svg'>/)
  assert.match(declarations, /export type AppIconProps/)
  assert.match(manifest, /sprite\.svg\?no-inline/)
  assert.match(manifest, /"framework": "astro"/)
  assert.match(manifest, /"componentName": "AppIcon"/)
  assert.match(manifest, /"mode": "astro@vite"/)
})

test('framework-family adapters have no horizontal mode imports', () => {
  for (const modeDirectory of ['angular-application', 'angular-webpack', 'astro-vite']) {
    for (const fileName of ['adapter.ts', 'output.ts']) {
      const source = fs.readFileSync(
        path.resolve(import.meta.dirname, '..', 'src', 'modes', modeDirectory, fileName),
        'utf8',
      )
      const imports = [...source.matchAll(/^import .* from ['"]([^'"]+)['"]$/gm)]
      for (const [, specifier] of imports) {
        if (specifier.startsWith('../')) assert.match(specifier, /^\.\.\/\.\.\//)
        assert.doesNotMatch(specifier, /(?:^|\/)modes\//)
      }
    }
  }
})
