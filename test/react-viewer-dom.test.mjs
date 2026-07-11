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

test('SpriteViewer opens an icon dialog with code tabs and copy action', async (context) => {
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
    Event: dom.window.Event,
    HTMLElement: dom.window.HTMLElement,
    HTMLDialogElement: dom.window.HTMLDialogElement,
    MouseEvent: dom.window.MouseEvent,
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
  dom.window.HTMLDialogElement.prototype.showModal = function showModal() { this.open = true }
  dom.window.HTMLDialogElement.prototype.close = function close() { this.open = false }

  const reactModule = await import('react')
  const { act: domAct } = await import('react-dom/test-utils')
  const act = reactModule.act ?? domAct
  const { createRoot } = await import('react-dom/client')
  const container = dom.window.document.querySelector('#root')
  const root = createRoot(container)

  context.after(async () => {
    await act(async () => root.unmount())
    dom.window.close()
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete globalThis[name]
    }
  })

  await act(async () => root.render(createElement(SpriteViewer, { sources: [manifest] })))
  assert.equal(container.querySelector('[data-sprite-viewer]').dataset.theme, undefined)

  const card = container.querySelector('[data-icon-name="check"]')
  assert.ok(card)
  await act(async () => card.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))

  const dialog = container.querySelector('dialog')
  assert.ok(dialog)
  assert.equal(dialog.open, true)
  assert.match(dialog.textContent, /check/)
  assert.match(dialog.textContent, /16 × 16/)
  assert.match(dialog.textContent, /ControlsIcon/)

  const reactTab = [...dialog.querySelectorAll('[role="tab"]')]
    .find((element) => element.textContent === 'React')
  await act(async () => reactTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    bubbles: true,
    key: 'ArrowRight',
  })))
  assert.equal(dialog.querySelector('[role="tab"][aria-selected="true"]').textContent, 'SVG')

  const colorSwatch = dialog.querySelector('[aria-label^="Изменить цвет --icon-color-1"]')
  assert.ok(colorSwatch)
  assert.equal(dialog.querySelector('.gromlab-sprite-viewer__hex-input'), null)
  await act(async () => {
    prefersDark = true
    for (const listener of mediaListeners) listener({ matches: true, media: darkModeMedia.media })
  })
  assert.equal(colorSwatch.style.backgroundColor, 'rgb(229, 229, 229)')

  await act(async () => colorSwatch.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.ok(dialog.querySelector('.react-colorful'))
  const colorRow = colorSwatch.closest('.gromlab-sprite-viewer__color-row')
  await act(async () => colorRow.dispatchEvent(new dom.window.Event('pointerdown', { bubbles: true })))
  assert.equal(dialog.querySelector('.react-colorful'), null)
  await act(async () => colorRow.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.equal(dialog.querySelector('.react-colorful'), null)

  await act(async () => colorSwatch.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  const colorPopover = dialog.querySelector('.gromlab-sprite-viewer__color-popover')
  await act(async () => colorPopover.querySelector('.react-colorful').dispatchEvent(
    new dom.window.Event('pointerdown', { bubbles: true }),
  ))
  assert.ok(dialog.querySelector('.react-colorful'))
  await act(async () => colorPopover.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    bubbles: true,
    key: 'Escape',
  })))
  assert.equal(dialog.querySelector('.react-colorful'), null)
  assert.ok(container.querySelector('dialog'))

  await act(async () => colorSwatch.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  const colorInput = dialog.querySelector('.gromlab-sprite-viewer__hex-input')
  assert.ok(colorInput)
  const setInputValue = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set
  setInputValue.call(colorInput, '#ff0000')
  await act(async () => colorInput.dispatchEvent(new dom.window.Event('input', { bubbles: true })))
  assert.match(dialog.querySelector('[role="tabpanel"]').textContent, /--icon-color-1/)
  assert.doesNotMatch(dialog.querySelector('[role="tabpanel"]').textContent, /React\.CSSProperties/)
  await act(async () => {
    prefersDark = false
    for (const listener of mediaListeners) listener({ matches: false, media: darkModeMedia.media })
  })
  assert.equal(colorSwatch.style.backgroundColor, 'rgb(255, 0, 0)')

  const cssTab = [...dialog.querySelectorAll('[role="tab"]')]
    .find((element) => element.textContent === 'CSS')
  assert.ok(cssTab)
  await act(async () => cssTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.match(dialog.querySelector('[role="tabpanel"]').textContent, /mask:/)

  const copyButton = [...dialog.querySelectorAll('button')]
    .find((element) => element.textContent === 'Копировать')
  assert.ok(copyButton)
  await act(async () => copyButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.equal(clipboardWrites.length, 1)
  assert.match(clipboardWrites[0], /background-color/)

  await act(async () => dialog.dispatchEvent(new dom.window.Event('cancel', { cancelable: true })))
  assert.equal(container.querySelector('dialog'), null)

  const themeButton = container.querySelector('[aria-label="Переключить тему"]')
  await act(async () => themeButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.equal(container.querySelector('[data-sprite-viewer]').dataset.theme, 'dark')

  await act(async () => root.render(createElement(SpriteViewer, {
    sources: [manifest],
    colorTheme: 'light',
  })))
  assert.equal(container.querySelector('[data-sprite-viewer]').dataset.theme, 'light')
  assert.equal(container.querySelector('[aria-label="Переключить тему"]'), null)

  const controlledChanges = []
  await act(async () => root.render(createElement(SpriteViewer, {
    sources: [manifest],
    colorTheme: 'light',
    onColorThemeChange: (theme) => controlledChanges.push(theme),
  })))
  const controlledThemeButton = container.querySelector('[aria-label="Переключить тему"]')
  await act(async () => controlledThemeButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.deepEqual(controlledChanges, ['dark'])
  assert.equal(container.querySelector('[data-sprite-viewer]').dataset.theme, 'light')

  await act(async () => root.render(createElement(SpriteViewer, {
    sources: [{ ...manifest, format: 'symbol' }],
  })))
  const symbolCard = container.querySelector('[data-icon-name="check"]')
  await act(async () => symbolCard.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })))
  assert.deepEqual(
    [...container.querySelectorAll('[role="tab"]')].map((element) => element.textContent),
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
  assert.equal(loaderCalls, 1)
  assert.match(container.textContent, /controls/)
})
