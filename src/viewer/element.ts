import { LitElement, html, nothing, unsafeCSS } from 'lit'
import type { PropertyValues, TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import {
  generateViewerCode,
  highlightViewerCode,
  normalizeHexColor,
  tabsForManifest,
  viewBoxSize,
} from './code.js'
import type { SpriteViewerTab } from './code.js'
import {
  compareManifests,
  isRemoteSource,
  normalizeSpriteViewerManifest,
  resolveViewerSource,
  sourceArray,
} from './source.js'
import { SPRITE_VIEWER_STYLES } from './styles.js'
import type {
  SpriteViewerColorTheme,
  SpriteViewerManifest,
  SpriteViewerManifestIcon,
  SpriteViewerSource,
  SpriteViewerSources,
} from './types.js'

const ELEMENT_NAME = 'gromlab-sprite-viewer'
const COLOR_PICKER_NAME = 'gromlab-hex-color-picker'
const COLOR_INPUT_NAME = 'gromlab-hex-input'

let colorElementsPromise: Promise<void> | undefined

function defineColorElements(): Promise<void> {
  if (customElements.get(COLOR_PICKER_NAME) && customElements.get(COLOR_INPUT_NAME)) return Promise.resolve()
  if (colorElementsPromise) return colorElementsPromise

  colorElementsPromise = Promise.all([
    import('vanilla-colorful/lib/entrypoints/hex'),
    import('vanilla-colorful/lib/entrypoints/hex-input'),
  ]).then(([{ HexBase }, { HexInputBase }]) => {
    if (!customElements.get(COLOR_PICKER_NAME)) {
      customElements.define(COLOR_PICKER_NAME, class extends HexBase {})
    }
    if (!customElements.get(COLOR_INPUT_NAME)) {
      customElements.define(COLOR_INPUT_NAME, class extends HexInputBase {})
    }
  })

  return colorElementsPromise
}

function countLabel(value: number, forms: readonly [string, string, string]): string {
  const modulo100 = value % 100
  const modulo10 = value % 10
  const form = modulo100 >= 11 && modulo100 <= 19
    ? forms[2]
    : modulo10 === 1
      ? forms[0]
      : modulo10 >= 2 && modulo10 <= 4
        ? forms[1]
        : forms[2]
  return `${value} ${form}`
}

function currentSystemTheme(): 'light' | 'dark' {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialColors(icon: SpriteViewerManifestIcon, currentColor: string): Record<string, string> {
  return Object.fromEntries(icon.colors.map(({ variable, fallback }) => [
    variable,
    normalizeHexColor(fallback, currentColor),
  ]))
}

type SelectedIcon = {
  key: string
  manifest: SpriteViewerManifest
  icon: SpriteViewerManifestIcon
}

type ColorChangedEvent = CustomEvent<{ value: string }>

class GromlabSpriteViewerElement extends LitElement {
  static properties = {
    sources: { attribute: false },
    viewerTitle: { attribute: 'viewer-title' },
    colorTheme: { attribute: 'color-theme' },
    themeControlled: { attribute: false },
    showThemeToggle: { attribute: false },
    manifestUrl: { attribute: 'manifest-url' },
    spriteUrl: { attribute: 'sprite-url' },
    _manifests: { state: true },
    _errors: { state: true },
    _loading: { state: true },
    _query: { state: true },
    _systemTheme: { state: true },
    _selected: { state: true },
    _activeTab: { state: true },
    _colors: { state: true },
    _colorOverrides: { state: true },
    _cssColor: { state: true },
    _cssColorOverridden: { state: true },
    _openColorControl: { state: true },
    _copied: { state: true },
  }

  static styles = unsafeCSS(SPRITE_VIEWER_STYLES)

  declare sources: SpriteViewerSources
  declare viewerTitle: string
  declare colorTheme: SpriteViewerColorTheme
  declare themeControlled: boolean
  declare showThemeToggle: boolean
  declare manifestUrl?: string
  declare spriteUrl?: string

  declare private _manifests: SpriteViewerManifest[]
  declare private _errors: string[]
  declare private _loading: boolean
  declare private _query: string
  declare private _systemTheme: 'light' | 'dark'
  declare private _selected: SelectedIcon | null
  declare private _activeTab: SpriteViewerTab
  declare private _colors: Record<string, string>
  declare private _colorOverrides: Record<string, string>
  declare private _cssColor: string
  declare private _cssColorOverridden: boolean
  declare private _openColorControl: string | null
  declare private _copied: boolean
  private _loadVersion = 0
  private _copyTimeout?: ReturnType<typeof setTimeout>
  private _media?: MediaQueryList

  constructor() {
    super()
    this.sources = []
    this.viewerTitle = 'SVG Sprites'
    this.colorTheme = 'auto'
    this.themeControlled = false
    this.showThemeToggle = true
    this._manifests = []
    this._errors = []
    this._loading = false
    this._query = ''
    this._systemTheme = currentSystemTheme()
    this._selected = null
    this._activeTab = 'svg'
    this._colors = {}
    this._colorOverrides = {}
    this._cssColor = '#1a1a1a'
    this._cssColorOverridden = false
    this._openColorControl = null
    this._copied = false
  }

  private readonly _handleMediaChange = () => {
    this._systemTheme = this._media?.matches ? 'dark' : 'light'
    this._syncThemeColors()
  }

  private readonly _handleDocumentPointerDown = (event: PointerEvent) => {
    if (!this._openColorControl) return
    const insideCurrentControl = event.composedPath().some((node) => (
      node instanceof HTMLElement
      && (node.dataset.colorTrigger === this._openColorControl
        || node.dataset.colorPopover === this._openColorControl)
    ))
    if (!insideCurrentControl) this._openColorControl = null
  }

  connectedCallback(): void {
    super.connectedCallback()
    void defineColorElements()
    this._media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    this._systemTheme = this._media?.matches ? 'dark' : 'light'
    this._media?.addEventListener('change', this._handleMediaChange)
    globalThis.document?.addEventListener('pointerdown', this._handleDocumentPointerDown, true)
  }

  disconnectedCallback(): void {
    this._media?.removeEventListener('change', this._handleMediaChange)
    globalThis.document?.removeEventListener('pointerdown', this._handleDocumentPointerDown, true)
    if (this._copyTimeout) clearTimeout(this._copyTimeout)
    super.disconnectedCallback()
  }

  protected updated(changed: PropertyValues<this>): void {
    if (changed.has('sources') || changed.has('manifestUrl') || changed.has('spriteUrl')) {
      void this._loadSources()
    }
    if (changed.has('colorTheme')) this._syncThemeColors()
  }

  private get _resolvedColorTheme(): 'light' | 'dark' {
    return this.colorTheme === 'auto' ? this._systemTheme : this.colorTheme
  }

  private get _themeColor(): string {
    return this._resolvedColorTheme === 'dark' ? '#e5e5e5' : '#1a1a1a'
  }

  private _effectiveSources(): readonly SpriteViewerSource[] {
    const configured = sourceArray(this.sources)
    if (configured.length > 0) return configured
    if (this.manifestUrl && this.spriteUrl) {
      return [{ manifestUrl: this.manifestUrl, spriteUrl: this.spriteUrl }]
    }
    return []
  }

  private async _loadSources(): Promise<void> {
    const version = ++this._loadVersion
    const sources = this._effectiveSources()
    const direct: SpriteViewerManifest[] = []
    const asynchronous: SpriteViewerSource[] = []
    const errors: string[] = []

    if (this.manifestUrl && !this.spriteUrl && sourceArray(this.sources).length === 0) {
      errors.push('The sprite-url attribute is required with manifest-url.')
    }

    for (const source of sources) {
      if (typeof source === 'function' || isRemoteSource(source)) {
        asynchronous.push(source)
        continue
      }
      try {
        direct.push(normalizeSpriteViewerManifest(source))
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
      }
    }

    this._manifests = direct.sort(compareManifests)
    this._errors = errors
    this._loading = asynchronous.length > 0
    this._selected = null

    if (asynchronous.length === 0) return
    const results = await Promise.allSettled(asynchronous.map(resolveViewerSource))
    if (version !== this._loadVersion) return

    const loaded: SpriteViewerManifest[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') loaded.push(result.value)
      else errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
    }
    this._manifests = [...direct, ...loaded].sort(compareManifests)
    this._errors = [...errors]
    this._loading = false
  }

  private _syncThemeColors(): void {
    if (!this._selected) return
    this._colors = {
      ...initialColors(this._selected.icon, this._themeColor),
      ...this._colorOverrides,
    }
    if (!this._cssColorOverridden) this._cssColor = this._themeColor
  }

  private _toggleTheme(): void {
    const theme: Exclude<SpriteViewerColorTheme, 'auto'> = this._resolvedColorTheme === 'dark' ? 'light' : 'dark'
    if (!this.themeControlled) this.colorTheme = theme
    this.dispatchEvent(new CustomEvent('color-theme-change', {
      bubbles: true,
      composed: true,
      detail: { theme },
    }))
  }

  private async _selectIcon(manifest: SpriteViewerManifest, icon: SpriteViewerManifestIcon): Promise<void> {
    const key = `${manifest.name}:${manifest.spriteUrl}:${icon.id}`
    this._selected = { key, manifest, icon }
    this._activeTab = tabsForManifest(manifest)[0]?.id ?? 'svg'
    this._colorOverrides = {}
    this._colors = initialColors(icon, this._themeColor)
    this._cssColor = this._themeColor
    this._cssColorOverridden = false
    this._openColorControl = null
    this._copied = false
    await this.updateComplete
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>('dialog')
    if (dialog && !dialog.open) dialog.showModal()
  }

  private _closeDialog(): void {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>('dialog')
    if (dialog?.open) dialog.close()
    this._selected = null
    this._openColorControl = null
  }

  private _handleBackdropClick(event: MouseEvent): void {
    if (!(event.currentTarget instanceof HTMLDialogElement) || event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const outside = event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom
    if (outside) this._closeDialog()
  }

  private _handleTabKeyDown(event: KeyboardEvent, tabIndex: number): void {
    if (!this._selected) return
    const tabs = tabsForManifest(this._selected.manifest)
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (tabIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (tabIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    this._activeTab = tabs[nextIndex].id
    const buttons = this.renderRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    void this.updateComplete.then(() => buttons[nextIndex]?.focus())
  }

  private _handleColorChange(variable: string, color: string): void {
    const normalized = normalizeHexColor(color)
    this._colors = { ...this._colors, [variable]: normalized }
    this._colorOverrides = { ...this._colorOverrides, [variable]: normalized }
  }

  private _handleCssColorChange(color: string): void {
    this._cssColor = normalizeHexColor(color)
    this._cssColorOverridden = true
  }

  private async _copyCode(code: string): Promise<void> {
    if (!globalThis.navigator?.clipboard) return
    try {
      await globalThis.navigator.clipboard.writeText(code)
      this._copied = true
      if (this._copyTimeout) clearTimeout(this._copyTimeout)
      this._copyTimeout = setTimeout(() => { this._copied = false }, 1500)
    } catch {
      this._copied = false
    }
  }

  private _renderColorControl(label: string, value: string, key: string, onChange: (value: string) => void): TemplateResult {
    const open = this._openColorControl === key
    const popoverId = `color-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    return html`
      <div class="gromlab-sprite-viewer__color-row">
        <button
          class="gromlab-sprite-viewer__swatch"
          type="button"
          data-color-trigger=${key}
          style=${styleMap({ backgroundColor: value })}
          aria-label=${`Изменить цвет ${label}`}
          aria-expanded=${String(open)}
          aria-controls=${ifDefined(open ? popoverId : undefined)}
          title=${`Изменить цвет ${label}`}
          @click=${() => { this._openColorControl = open ? null : key }}
        ></button>
        <code class="gromlab-sprite-viewer__color-label">${label}</code>
        ${open ? html`
          <div
            id=${popoverId}
            class="gromlab-sprite-viewer__color-popover"
            data-color-popover=${key}
            role="dialog"
            aria-label=${`Выбор цвета ${label}`}
            @keydown=${(event: KeyboardEvent) => {
              if (event.key !== 'Escape') return
              event.preventDefault()
              event.stopPropagation()
              this._openColorControl = null
            }}
          >
            <gromlab-hex-color-picker
              class="gromlab-sprite-viewer__color-picker"
              .color=${value}
              @color-changed=${(event: ColorChangedEvent) => onChange(event.detail.value)}
            ></gromlab-hex-color-picker>
            <gromlab-hex-input
              class="gromlab-sprite-viewer__hex-input"
              .color=${value}
              .prefixed=${true}
              aria-label=${`HEX-значение ${label}`}
              @color-changed=${(event: ColorChangedEvent) => onChange(event.detail.value)}
            ></gromlab-hex-input>
          </div>
        ` : nothing}
      </div>
    `
  }

  private _renderDialogPreview(manifest: SpriteViewerManifest, icon: SpriteViewerManifestIcon): TemplateResult {
    const href = `${manifest.spriteUrl}#${icon.id}`
    if (this._activeTab === 'img') {
      return html`<img class="gromlab-sprite-viewer__dialog-img" src=${href} alt=${icon.name}>`
    }
    if (this._activeTab === 'css') {
      return html`
        <div
          class="gromlab-sprite-viewer__dialog-mask"
          role="img"
          aria-label=${icon.name}
          style=${styleMap({
            backgroundColor: this._cssColor,
            mask: `url('${href}') no-repeat center / contain`,
            '-webkit-mask': `url('${href}') no-repeat center / contain`,
          })}
        ></div>
      `
    }
    return html`
      <svg
        class="gromlab-sprite-viewer__dialog-icon"
        viewBox=${ifDefined(icon.viewBox ?? undefined)}
        aria-label=${icon.name}
        role="img"
      >
        <use href=${href}></use>
      </svg>
    `
  }

  private _renderDialog(): TemplateResult | typeof nothing {
    if (!this._selected) return nothing
    const { manifest, icon } = this._selected
    const tabs = tabsForManifest(manifest)
    const activeTab = tabs.some((tab) => tab.id === this._activeTab) ? this._activeTab : tabs[0].id
    const code = generateViewerCode({
      manifest,
      icon,
      tab: activeTab,
      colorOverrides: this._colorOverrides,
      cssColor: this._cssColor,
    })
    const dimensions = viewBoxSize(icon.viewBox)
    const colorsVisible = activeTab !== 'img' && activeTab !== 'css'

    return html`
      <dialog
        class="gromlab-sprite-viewer__dialog"
        aria-labelledby="viewer-dialog-title"
        @cancel=${(event: Event) => { event.preventDefault(); this._closeDialog() }}
        @click=${this._handleBackdropClick}
      >
        <div class="gromlab-sprite-viewer__dialog-shell">
          <button
            class="gromlab-sprite-viewer__close"
            type="button"
            aria-label="Закрыть"
            autofocus
            @click=${this._closeDialog}
          >&#x2715;</button>

          <div class="gromlab-sprite-viewer__dialog-preview" style=${styleMap(this._colors)}>
            <div class="gromlab-sprite-viewer__dialog-preview-canvas">
              ${this._renderDialogPreview(manifest, icon)}
            </div>
          </div>

          <div class="gromlab-sprite-viewer__dialog-heading">
            <h2 id="viewer-dialog-title" class="gromlab-sprite-viewer__dialog-title">${icon.name}</h2>
            ${dimensions ? html`<span class="gromlab-sprite-viewer__viewbox">${dimensions}</span>` : nothing}
          </div>
          <p class="gromlab-sprite-viewer__dialog-meta">${manifest.name} · ${manifest.format} · ${manifest.target}</p>

          <div class="gromlab-sprite-viewer__colors">
            ${colorsVisible && icon.colors.length > 0 ? html`
              <p class="gromlab-sprite-viewer__hint">
                Цвета применяются к превью через CSS-переменные и попадут в пример кода.
              </p>
              <h3 class="gromlab-sprite-viewer__colors-title">CSS Variables</h3>
              ${icon.colors.map(({ variable, fallback }) => this._renderColorControl(
                `${variable}: ${fallback}`,
                this._colors[variable],
                variable,
                (color) => this._handleColorChange(variable, color),
              ))}
            ` : nothing}
            ${colorsVisible && icon.colors.length === 0 ? html`
              <p class="gromlab-sprite-viewer__hint">У иконки нет настраиваемых цветовых переменных.</p>
            ` : nothing}
            ${activeTab === 'img' ? html`
              <p class="gromlab-sprite-viewer__hint">
                IMG изолирует SVG: CSS-переменные и currentColor внутрь изображения не передаются.
              </p>
            ` : nothing}
            ${activeTab === 'css' ? html`
              <p class="gromlab-sprite-viewer__hint">
                CSS mask отображает иконку одним цветом через background-color.
              </p>
              ${this._renderColorControl(
                'background-color',
                this._cssColor,
                'background-color',
                (color) => this._handleCssColorChange(color),
              )}
            ` : nothing}
          </div>

          <div class="gromlab-sprite-viewer__tabs" role="tablist" aria-label="Способ подключения">
            ${tabs.map((tab, tabIndex) => html`
              <button
                id=${`viewer-${tab.id}-tab`}
                class="gromlab-sprite-viewer__tab"
                type="button"
                role="tab"
                aria-selected=${String(activeTab === tab.id)}
                aria-controls="viewer-code-panel"
                tabindex=${activeTab === tab.id ? 0 : -1}
                @click=${() => { this._activeTab = tab.id }}
                @keydown=${(event: KeyboardEvent) => this._handleTabKeyDown(event, tabIndex)}
              >${tab.label}</button>
            `)}
          </div>

          <div
            id="viewer-code-panel"
            class="gromlab-sprite-viewer__code"
            role="tabpanel"
            aria-labelledby=${`viewer-${activeTab}-tab`}
          >
            <pre><code>${unsafeHTML(highlightViewerCode(code.code, code.language))}</code></pre>
            <button
              class="gromlab-sprite-viewer__copy"
              type="button"
              @click=${() => { void this._copyCode(code.code) }}
            >${this._copied ? 'Скопировано' : 'Копировать'}</button>
          </div>
        </div>
      </dialog>
    `
  }

  protected render(): TemplateResult {
    const normalizedQuery = this._query.trim().toLowerCase()
    const visibleGroups = this._manifests
      .map((manifest) => ({
        manifest,
        icons: manifest.icons.filter((icon) => (
          normalizedQuery === ''
          || icon.name.toLowerCase().includes(normalizedQuery)
          || manifest.name.toLowerCase().includes(normalizedQuery)
        )),
      }))
      .filter((group) => group.icons.length > 0)
    const totalIcons = this._manifests.reduce((total, manifest) => total + manifest.iconCount, 0)
    const visibleIcons = visibleGroups.reduce((total, group) => total + group.icons.length, 0)

    return html`
      <section
        class="gromlab-sprite-viewer"
        data-sprite-viewer
        data-theme=${ifDefined(this.colorTheme === 'auto' ? undefined : this.colorTheme)}
      >
        <header class="gromlab-sprite-viewer__header">
          <h1 class="gromlab-sprite-viewer__title">${this.viewerTitle}</h1>
          <span class="gromlab-sprite-viewer__summary">
            ${countLabel(this._manifests.length, ['спрайт', 'спрайта', 'спрайтов'])}
            · ${countLabel(totalIcons, ['иконка', 'иконки', 'иконок'])}
            ${normalizedQuery ? ` · найдено ${visibleIcons}` : nothing}
          </span>
          <div class="gromlab-sprite-viewer__toolbar">
            <input
              class="gromlab-sprite-viewer__search"
              type="search"
              .value=${this._query}
              @input=${(event: InputEvent) => { this._query = (event.currentTarget as HTMLInputElement).value }}
              placeholder="Найти иконку"
              aria-label="Поиск иконок"
            >
            ${this.showThemeToggle ? html`
              <button
                class="gromlab-sprite-viewer__theme"
                type="button"
                aria-label="Переключить тему"
                title="Переключить тему"
                @click=${this._toggleTheme}
              >&#x25D1;</button>
            ` : nothing}
          </div>
        </header>

        ${this._errors.length > 0 ? html`
          <div class="gromlab-sprite-viewer__errors" role="alert">
            ${this._errors.map((error) => html`<div>${error}</div>`)}
          </div>
        ` : nothing}

        ${visibleGroups.map(({ manifest, icons }) => html`
          <section class="gromlab-sprite-viewer__group">
            <div class="gromlab-sprite-viewer__group-header">
              <h2 class="gromlab-sprite-viewer__group-title">${manifest.name}</h2>
              <span class="gromlab-sprite-viewer__badge">${manifest.format}</span>
              <span class="gromlab-sprite-viewer__group-count">${icons.length}</span>
              ${manifest.description ? html`
                <p class="gromlab-sprite-viewer__description">${manifest.description}</p>
              ` : nothing}
            </div>
            <div class="gromlab-sprite-viewer__grid">
              ${icons.map((icon) => html`
                <button
                  class="gromlab-sprite-viewer__card"
                  type="button"
                  data-icon-name=${icon.name}
                  title=${`Открыть ${icon.name}`}
                  @click=${() => { void this._selectIcon(manifest, icon) }}
                >
                  <span class="gromlab-sprite-viewer__icon-wrap">
                    <svg
                      class="gromlab-sprite-viewer__icon"
                      viewBox=${ifDefined(icon.viewBox ?? undefined)}
                      aria-hidden="true"
                    >
                      <use href=${`${manifest.spriteUrl}#${icon.id}`}></use>
                    </svg>
                  </span>
                  <span class="gromlab-sprite-viewer__icon-name">${icon.name}</span>
                </button>
              `)}
            </div>
          </section>
        `)}

        ${visibleGroups.length === 0 && (!this._loading || this._manifests.length > 0) ? html`
          <div class="gromlab-sprite-viewer__status">
            ${this._manifests.length === 0 ? 'Спрайты не подключены' : 'Иконки не найдены'}
          </div>
        ` : nothing}
        ${this._loading && this._manifests.length === 0 ? html`
          <div class="gromlab-sprite-viewer__status">Загрузка спрайтов...</div>
        ` : nothing}

        <footer class="gromlab-sprite-viewer__footer">
          <span>@gromlab/svg-sprites</span>
          <a href="https://github.com/gromlab-ru/svg-sprites" target="_blank" rel="noreferrer">Repository</a>
        </footer>

        ${this._renderDialog()}
      </section>
    `
  }
}

export function defineSpriteViewerElement(): void {
  if (!customElements.get(ELEMENT_NAME)) customElements.define(ELEMENT_NAME, GromlabSpriteViewerElement)
}
