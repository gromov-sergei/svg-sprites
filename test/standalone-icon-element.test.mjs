import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

import { JSDOM } from 'jsdom'

import { generateSprite } from '../dist/index.js'

const CHECK_SVG = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16 4 11l2-2 3 3 8-8 2 2z"/></svg>'
const UNSAFE_SVG = '<svg viewBox="0 0 16 16"><path d="M1 1h14v14H1z"/></svg>'

test('standalone Webpack icon element renders generated icons without external runtime dependencies', async (context) => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-icon-element-'))
  const iconsDir = path.join(rootDir, 'icons')
  fs.mkdirSync(iconsDir)
  fs.writeFileSync(path.join(rootDir, 'package.json'), '{"type":"module"}')
  fs.writeFileSync(path.join(iconsDir, 'check.svg'), CHECK_SVG)
  fs.writeFileSync(path.join(iconsDir, 'folder open.svg'), UNSAFE_SVG)

  await generateSprite(rootDir, {
    mode: 'standalone@webpack',
    name: 'app-icons',
    generatedNotice: false,
  })

  const entryUrl = pathToFileURL(path.join(rootDir, '.svg-sprite', 'index.js')).href
  const generated = await import(entryUrl)
  assert.equal(generated.appIconsIconTagName, 'app-icons-icon')
  assert.doesNotThrow(() => generated.defineAppIconsIconElement())

  const dom = new JSDOM('<body></body>', { url: 'https://example.test/' })
  const originals = new Map()
  for (const [name, value] of Object.entries({
    HTMLElement: dom.window.HTMLElement,
    customElements: dom.window.customElements,
  })) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  }

  const browserErrors = []
  const originalConsoleError = console.error
  console.error = (...values) => browserErrors.push(values.join(' '))

  context.after(() => {
    console.error = originalConsoleError
    dom.window.close()
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete globalThis[name]
    }
  })

  const icon = dom.window.document.createElement('app-icons-icon')
  icon.icon = 'folder open'
  dom.window.document.body.append(icon)

  generated.defineAppIconsIconElement()
  generated.defineAppIconsIconElement()

  assert.equal(icon.icon, 'folder open')
  assert.equal(icon.getAttribute('icon'), 'folder open')
  assert.equal(icon.shadowRoot.querySelector('svg').getAttribute('viewBox'), '0 0 16 16')
  assert.equal(
    icon.shadowRoot.querySelector('use').getAttribute('href'),
    generated.getAppIconsIconHref('folder open'),
  )
  assert.match(icon.shadowRoot.querySelector('use').getAttribute('href'), /#icon-[a-f0-9]{16}$/)

  icon.icon = 'check'
  assert.equal(icon.shadowRoot.querySelector('svg').getAttribute('viewBox'), '0 0 24 24')
  assert.match(icon.shadowRoot.querySelector('use').getAttribute('href'), /sprite\.svg#check$/)
  assert.throws(() => { icon.icon = 'missing' }, /Unknown app-icons icon: missing/)

  icon.setAttribute('icon', 'missing')
  assert.equal(icon.icon, null)
  assert.equal(icon.shadowRoot.querySelector('use').hasAttribute('href'), false)
  assert.equal(icon.shadowRoot.querySelector('svg').hasAttribute('hidden'), true)
  assert.deepEqual(browserErrors, ['<app-icons-icon>: unknown icon "missing".'])

  const collisionDom = new JSDOM('<body></body>')
  Object.defineProperty(globalThis, 'HTMLElement', {
    configurable: true,
    writable: true,
    value: collisionDom.window.HTMLElement,
  })
  Object.defineProperty(globalThis, 'customElements', {
    configurable: true,
    writable: true,
    value: collisionDom.window.customElements,
  })
  collisionDom.window.customElements.define(
    'app-icons-icon',
    class extends collisionDom.window.HTMLElement {},
  )
  assert.throws(
    () => generated.defineAppIconsIconElement(),
    /Cannot define <app-icons-icon>: this custom element name is already registered/,
  )
  collisionDom.window.close()
})
