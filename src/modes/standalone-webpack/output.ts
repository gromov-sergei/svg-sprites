import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'standalone@webpack'
const TARGET = 'webpack'
const OUTPUT_DIR = '.svg-sprite'
const NOTICE = 'АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. Не редактируйте вручную.'

function pascal(value: string): string {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function camel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function header(enabled: boolean): string {
  return enabled
    ? `/*\n * ${NOTICE}\n * ${GENERATED_MARKER}.\n */`
    : `/* ${GENERATED_MARKER}. Do not edit. */`
}

function svg(bytes: Uint8Array, enabled: boolean): string {
  const marker = enabled ? `${NOTICE}\n  ${GENERATED_MARKER}.` : `${GENERATED_MARKER}. Do not edit.`
  const content = new TextDecoder().decode(bytes)
  return content.startsWith('<?xml')
    ? content.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n<!-- ${marker} -->\n`)
    : `<!-- ${marker} -->\n${content}`
}

function description(config: ResolvedSpriteConfig): string[] {
  const text = config.description ?? `Имена иконок SVG-спрайта «${config.name}».`
  return ['/**', ...text.split(/\r?\n/).map((line) => ` * ${line.replace(/\*\//g, '* /')}`), ' */']
}

function iconData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const prefix = camel(config.name)
  return [
    header(config.generatedNotice),
    '',
    ...description(config),
    `export const ${prefix}IconNames = ${JSON.stringify(artifact.icons.map((icon) => icon.name), null, 2)}`,
    '',
    `export const ${prefix}IconIds = ${JSON.stringify(Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id])), null, 2)}`,
    '',
  ].join('\n')
}

function iconDeclarations(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const name = `${pascal(config.name)}IconName`
  const names = `${camel(config.name)}IconNames`
  const ids = `${camel(config.name)}IconIds`
  return [
    header(config.generatedNotice),
    '',
    ...description(config),
    `export declare const ${names}: readonly [`,
    ...artifact.icons.map((icon) => `  ${JSON.stringify(icon.name)},`),
    ']',
    `export type ${name} = typeof ${names}[number]`,
    `export declare const ${ids}: {`,
    ...artifact.icons.map((icon) => `  readonly ${JSON.stringify(icon.name)}: ${JSON.stringify(icon.id)}`),
    '}',
    '',
  ].join('\n')
}

function index(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const prefix = camel(config.name)
  const pascalName = pascal(config.name)
  const iconTagName = `${config.name}-icon`
  return [
    header(config.generatedNotice),
    `import { ${prefix}IconIds, ${prefix}IconNames } from './icon-data.js'`,
    '',
    `export { ${prefix}IconIds, ${prefix}IconNames }`,
    `export const ${prefix}SpriteUrl = new URL('./sprite.svg', import.meta.url).href`,
    `export const ${prefix}IconTagName = ${JSON.stringify(iconTagName)}`,
    `const ${prefix}IconViewBoxes = ${JSON.stringify(Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.viewBox])), null, 2)}`,
    `const ${prefix}IconElementMarker = Symbol.for('@gromlab/svg-sprites/icon-element')`,
    `const ${prefix}IconElementSignature = ${prefix}IconTagName + '|' + ${prefix}SpriteUrl`,
    `function has${pascalName}Icon(icon) {`,
    `  return Object.prototype.hasOwnProperty.call(${prefix}IconIds, icon)`,
    '}',
    `export function get${pascalName}IconHref(icon) {`,
    `  return ${prefix}SpriteUrl + '#' + ${prefix}IconIds[icon]`,
    '}',
    `export function define${pascalName}IconElement() {`,
    `  if (typeof globalThis.customElements === 'undefined' || typeof globalThis.HTMLElement === 'undefined') return`,
    `  const existing = globalThis.customElements.get(${prefix}IconTagName)`,
    '  if (existing) {',
    `    if (existing[${prefix}IconElementMarker] === ${prefix}IconElementSignature) return`,
    `    throw new Error('Cannot define <' + ${prefix}IconTagName + '>: this custom element name is already registered.')`,
    '  }',
    `  class ${pascalName}IconElement extends globalThis.HTMLElement {`,
    "    static observedAttributes = ['icon']",
    '    constructor() {',
    '      super()',
    '      const ownerDocument = this.ownerDocument',
    "      const shadowRoot = this.attachShadow({ mode: 'open' })",
    "      const style = ownerDocument.createElement('style')",
    "      style.textContent = ':host{display:inline-block;width:1em;height:1em;vertical-align:-0.125em}:host([hidden]){display:none}svg{display:block;width:100%;height:100%}svg[hidden]{display:none}'",
    "      this._svg = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg')",
    "      this._svg.setAttribute('part', 'svg')",
    "      this._svg.setAttribute('aria-hidden', 'true')",
    "      this._svg.setAttribute('focusable', 'false')",
    "      this._svg.setAttribute('hidden', '')",
    "      this._use = ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'use')",
    "      this._use.setAttribute('part', 'use')",
    '      this._svg.append(this._use)',
    '      shadowRoot.append(style, this._svg)',
    '    }',
    '    connectedCallback() {',
    "      if (Object.prototype.hasOwnProperty.call(this, 'icon')) {",
    '        const icon = this.icon',
    '        delete this.icon',
    '        this.icon = icon',
    '      }',
    '      this._renderIcon()',
    '    }',
    '    attributeChangedCallback() {',
    '      this._renderIcon()',
    '    }',
    '    get icon() {',
    "      const icon = this.getAttribute('icon')",
    `      return icon !== null && has${pascalName}Icon(icon) ? icon : null`,
    '    }',
    '    set icon(icon) {',
    '      if (icon === null || icon === undefined) {',
    "        this.removeAttribute('icon')",
    '        return',
    '      }',
    `      if (!has${pascalName}Icon(icon)) throw new TypeError('Unknown ${config.name} icon: ' + icon)`,
    "      this.setAttribute('icon', icon)",
    '    }',
    '    _renderIcon() {',
    "      const icon = this.getAttribute('icon')",
    '      if (icon === null) {',
    '        this._clearIcon()',
    '        return',
    '      }',
    `      if (!has${pascalName}Icon(icon)) {`,
    '        this._clearIcon()',
    `        if (this._invalidIcon !== icon) console.error('<' + ${prefix}IconTagName + '>: unknown icon "' + icon + '".')`,
    '        this._invalidIcon = icon',
    '        return',
    '      }',
    '      this._invalidIcon = undefined',
    `      const viewBox = ${prefix}IconViewBoxes[icon]`,
    "      if (viewBox === null) this._svg.removeAttribute('viewBox')",
    "      else this._svg.setAttribute('viewBox', viewBox)",
    `      this._use.setAttribute('href', get${pascalName}IconHref(icon))`,
    "      this._svg.removeAttribute('hidden')",
    '    }',
    '    _clearIcon() {',
    "      this._use.removeAttribute('href')",
    "      this._svg.removeAttribute('viewBox')",
    "      this._svg.setAttribute('hidden', '')",
    '    }',
    '  }',
    `  Object.defineProperty(${pascalName}IconElement, ${prefix}IconElementMarker, { value: ${prefix}IconElementSignature })`,
    `  globalThis.customElements.define(${prefix}IconTagName, ${pascalName}IconElement)`,
    '}',
    '',
  ].join('\n')
}

function indexDeclarations(config: ResolvedSpriteConfig): string {
  const prefix = camel(config.name)
  const pascalName = pascal(config.name)
  const iconTagName = `${config.name}-icon`
  return [
    header(config.generatedNotice),
    `import type { ${pascalName}IconName } from './icon-data.js'`,
    '',
    `export { ${prefix}IconIds, ${prefix}IconNames } from './icon-data.js'`,
    `export type { ${pascalName}IconName } from './icon-data.js'`,
    `export declare const ${prefix}SpriteUrl: string`,
    `export declare const ${prefix}IconTagName: ${JSON.stringify(iconTagName)}`,
    `export declare function get${pascalName}IconHref(icon: ${pascalName}IconName): string`,
    `export interface ${pascalName}IconElement extends HTMLElement {`,
    `  icon: ${pascalName}IconName | null`,
    '}',
    `export declare function define${pascalName}IconElement(): void`,
    'declare global {',
    '  interface HTMLElementTagNameMap {',
    `    ${JSON.stringify(iconTagName)}: ${pascalName}IconElement`,
    '  }',
    '}',
    '',
  ].join('\n')
}

function manifestData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact) {
  return {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    mode: MODE,
    target: TARGET,
    format: artifact.format,
    iconCount: artifact.icons.length,
    icons: artifact.icons,
  }
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  return [
    header(config.generatedNotice),
    "const spriteUrl = new URL('./sprite.svg', import.meta.url).href",
    '',
    `export const spriteManifestData = ${JSON.stringify(manifestData(config, artifact), null, 2)}`,
    'export function createSpriteManifest(publicSpriteUrl) {',
    '  return { ...spriteManifestData, spriteUrl: publicSpriteUrl }',
    '}',
    'export const spriteManifest = createSpriteManifest(spriteUrl)',
    '',
    'export default spriteManifest',
    '',
  ].join('\n')
}

function manifestTypes(config: ResolvedSpriteConfig): string {
  return [
    header(config.generatedNotice),
    '',
    'export type SpriteManifestColor = {',
    '  variable: `--icon-color-${number}`',
    '  fallback: string',
    '}',
    'export type SpriteManifestIcon = {',
    '  name: string',
    '  id: string',
    '  viewBox: string | null',
    '  colors: readonly SpriteManifestColor[]',
    '}',
    'export type SpriteManifestData = {',
    '  schemaVersion: 1',
    "  generator: '@gromlab/svg-sprites'",
    '  name: string',
    '  description?: string',
    "  mode: 'standalone@webpack'",
    "  target: 'webpack'",
    "  format: 'stack' | 'symbol'",
    '  iconCount: number',
    '  icons: readonly SpriteManifestIcon[]',
    '}',
    'export type SpriteManifest = SpriteManifestData & { spriteUrl: string }',
    '',
    'export declare const spriteManifestData: SpriteManifestData',
    'export declare function createSpriteManifest(spriteUrl: string): SpriteManifest',
    'export declare const spriteManifest: SpriteManifest',
    'export default spriteManifest',
    '',
  ].join('\n')
}

export function generateOutputFiles(
  config: ResolvedSpriteConfig,
  artifact: CompiledSpriteArtifact,
): GeneratedFile[] {
  return [
    { path: path.posix.join(OUTPUT_DIR, 'index.js'), content: index(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'index.d.ts'), content: indexDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: svg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconDeclarations(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestTypes(config) },
  ]
}
