import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement, StrictMode } from 'react'
import { JSDOM } from 'jsdom'

import { SpriteViewer } from '../dist/react.js'

const manifest = {
  schemaVersion: 1,
  generator: '@gromlab/svg-sprites',
  name: 'controls',
  description: 'Control icons',
  componentName: 'ControlsIcon',
  mode: 'react@vite',
  target: 'vite',
  format: 'stack',
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

test('SpriteViewer bridges React to the interactive Viewer Web Component', async (context) => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/' })
  const originals = new Map()
  const mediaListeners = new Set()
  let prefersDark = false
  const darkModeMedia = {
    get matches() { return prefersDark },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (event, listener) => { if (event === 'change') mediaListeners.add(listener) },
    removeEventListener: (event, listener) => { if (event === 'change') mediaListeners.delete(listener) },
  }
  const matchMedia = () => darkModeMedia
  dom.window.matchMedia = matchMedia
  const globals = {
    document: dom.window.document,
    window: dom.window,
    self: dom.window,
    navigator: dom.window.navigator,
    Node: dom.window.Node,
    Element: dom.window.Element,
    Document: dom.window.Document,
    DocumentFragment: dom.window.DocumentFragment,
    Event: dom.window.Event,
    CustomEvent: dom.window.CustomEvent,
    HTMLElement: dom.window.HTMLElement,
    HTMLDialogElement: dom.window.HTMLDialogElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    KeyboardEvent: dom.window.KeyboardEvent,
    MouseEvent: dom.window.MouseEvent,
    ShadowRoot: dom.window.ShadowRoot,
    CSSStyleSheet: dom.window.CSSStyleSheet,
    MutationObserver: dom.window.MutationObserver,
    customElements: dom.window.customElements,
    matchMedia,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  }

  for (const [name, value] of Object.entries(globals)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  }

  const clipboardWrites = []
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (value) => { clipboardWrites.push(value) } },
  })
  dom.window.HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', '') }
  dom.window.HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open') }

  const reactModule = await import('react')
  const { act: domAct } = await import('react-dom/test-utils')
  const act = reactModule.act ?? domAct
  const { createRoot } = await import('react-dom/client')
  const container = dom.window.document.querySelector('#root')
  const root = createRoot(container)

  async function viewerRoot() {
    await act(async () => {
      await dom.window.customElements.whenDefined('gromlab-sprite-viewer')
      await Promise.resolve()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    const host = container.querySelector('gromlab-sprite-viewer')
    assert.ok(host)
    await host.updateComplete
    return { host, shadow: host.shadowRoot }
  }

  async function settle(host) {
    await act(async () => {
      await host.updateComplete
      await Promise.resolve()
    })
  }

  context.after(async () => {
    await act(async () => root.unmount())
    dom.window.close()
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete globalThis[name]
    }
  })

  await act(async () => root.render(createElement(SpriteViewer, { sources: [manifest], title: 'Icon catalog' })))
  let { host, shadow } = await viewerRoot()
  assert.equal(host.viewerTitle, 'Icon catalog')
  assert.equal(shadow.querySelector('[data-sprite-viewer]').dataset.theme, undefined)
  assert.match(shadow.textContent, /Icon catalog/)
  assert.match(shadow.textContent, /1 спрайт\s*· 1 иконка/)

  const card = shadow.querySelector('[data-icon-name="check"]')
  assert.ok(card)
  card.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, composed: true }))
  await settle(host)

  let dialog = shadow.querySelector('dialog')
  assert.ok(dialog)
  assert.equal(dialog.open, true)
  assert.match(dialog.textContent, /16 × 16/)
  assert.match(dialog.textContent, /ControlsIcon/)

  const reactTab = [...dialog.querySelectorAll('[role="tab"]')]
    .find((element) => element.textContent === 'React')
  reactTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))
  await settle(host)
  assert.equal(dialog.querySelector('[role="tab"][aria-selected="true"]').textContent, 'SVG')

  const colorSwatch = dialog.querySelector('[aria-label^="Изменить цвет --icon-color-1"]')
  assert.ok(colorSwatch)
  prefersDark = true
  for (const listener of mediaListeners) listener({ matches: true, media: darkModeMedia.media })
  await settle(host)
  assert.equal(colorSwatch.style.backgroundColor, 'rgb(229, 229, 229)')

  colorSwatch.click()
  await settle(host)
  await dom.window.customElements.whenDefined('gromlab-hex-input')
  const colorInputElement = dialog.querySelector('gromlab-hex-input')
  assert.ok(colorInputElement)
  const colorInput = colorInputElement.shadowRoot.querySelector('input')
  colorInput.value = '#ff0000'
  colorInput.dispatchEvent(new dom.window.Event('input', { bubbles: true, composed: true }))
  await settle(host)
  assert.match(dialog.querySelector('[role="tabpanel"]').textContent, /--icon-color-1/)
  assert.equal(colorSwatch.style.backgroundColor, 'rgb(255, 0, 0)')

  const cssTab = [...dialog.querySelectorAll('[role="tab"]')]
    .find((element) => element.textContent === 'CSS')
  cssTab.click()
  await settle(host)
  assert.match(dialog.querySelector('[role="tabpanel"]').textContent, /mask:/)

  const copyButton = [...dialog.querySelectorAll('button')]
    .find((element) => element.textContent === 'Копировать')
  copyButton.click()
  await settle(host)
  assert.equal(clipboardWrites.length, 1)
  assert.match(clipboardWrites[0], /background-color/)

  dialog.dispatchEvent(new dom.window.Event('cancel', { cancelable: true }))
  await settle(host)
  assert.equal(shadow.querySelector('dialog'), null)

  const themeButton = shadow.querySelector('[aria-label="Переключить тему"]')
  themeButton.click()
  await settle(host)
  assert.equal(shadow.querySelector('[data-sprite-viewer]').dataset.theme, 'light')

  await act(async () => root.render(createElement(SpriteViewer, {
    sources: [manifest],
    colorTheme: 'light',
  })))
  ;({ host, shadow } = await viewerRoot())
  await settle(host)
  assert.equal(shadow.querySelector('[data-sprite-viewer]').dataset.theme, 'light')
  assert.equal(shadow.querySelector('[aria-label="Переключить тему"]'), null)

  const controlledChanges = []
  await act(async () => root.render(createElement(SpriteViewer, {
    sources: [manifest],
    colorTheme: 'light',
    onColorThemeChange: (theme) => controlledChanges.push(theme),
  })))
  ;({ host, shadow } = await viewerRoot())
  await settle(host)
  shadow.querySelector('[aria-label="Переключить тему"]').click()
  await settle(host)
  assert.deepEqual(controlledChanges, ['dark'])
  assert.equal(shadow.querySelector('[data-sprite-viewer]').dataset.theme, 'light')

  await act(async () => root.render(createElement(SpriteViewer, {
    sources: [{ ...manifest, format: 'symbol' }],
  })))
  ;({ host, shadow } = await viewerRoot())
  await settle(host)
  shadow.querySelector('[data-icon-name="check"]').click()
  await settle(host)
  assert.deepEqual(
    [...shadow.querySelectorAll('[role="tab"]')].map((element) => element.textContent),
    ['React', 'SVG'],
  )

  let loaderCalls = 0
  const loader = async () => {
    loaderCalls++
    return manifest
  }
  await act(async () => root.render(createElement(
    StrictMode,
    null,
    createElement(SpriteViewer, { sources: [loader] }),
  )))
  ;({ host, shadow } = await viewerRoot())
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await host.updateComplete
  })
  assert.equal(loaderCalls, 1)
  assert.match(shadow.textContent, /controls/)
})
