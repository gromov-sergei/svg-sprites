import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SpriteViewer } from '../dist/react.js'

const manifest = {
  schemaVersion: 1,
  generator: '@gromlab/svg-sprites',
  name: 'controls',
  description: 'Control icons',
  componentName: 'ControlsIcon',
  target: 'vite',
  format: 'symbol',
  iconCount: 1,
  spriteUrl: '/assets/controls.svg',
  icons: [
    {
      name: 'check',
      id: 'check',
      viewBox: '0 0 16 16',
      colors: [{ variable: '--icon-color-1', fallback: 'currentColor' }],
    },
  ],
}

test('React entry is a Next.js client boundary', () => {
  const reactEntry = fs.readFileSync(path.resolve('dist/react.js'), 'utf-8')
  const coreEntry = fs.readFileSync(path.resolve('dist/index.js'), 'utf-8')
  assert.match(reactEntry, /^['"]use client['"];?/)
  assert.doesNotMatch(coreEntry, /from ["']react(?:\/jsx-runtime)?["']/)
})

test('SpriteViewer renders direct sprite manifests', () => {
  const markup = renderToStaticMarkup(createElement(SpriteViewer, {
    sources: [manifest],
    title: 'Icon catalog',
  }))

  assert.match(markup, /^<gromlab-sprite-viewer/)
  assert.match(markup, /data-sprite-viewer-host=""/)
  assert.doesNotMatch(markup, /Icon catalog/)
})

test('SpriteViewer accepts a loader record from import.meta.glob', () => {
  const markup = renderToStaticMarkup(createElement(SpriteViewer, {
    sources: {
      '/src/controls/manifest.ts': async () => ({ default: manifest }),
    },
  }))

  assert.match(markup, /^<gromlab-sprite-viewer/)
})

test('SpriteViewer supports an externally controlled color theme', () => {
  const markup = renderToStaticMarkup(createElement(SpriteViewer, {
    sources: [manifest],
    colorTheme: 'dark',
  }))

  assert.match(markup, /^<gromlab-sprite-viewer/)
  assert.doesNotMatch(markup, /data-theme=/)
})
