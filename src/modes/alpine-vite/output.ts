import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'alpine@vite'
const TARGET = 'vite'
const OUTPUT_DIR = '.svg-sprite'
const NOTICE = 'AUTOMATICALLY GENERATED FILE. Do not edit manually.'

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

function markedSvg(bytes: Uint8Array, enabled: boolean): string {
  const marker = enabled ? `${NOTICE} ${GENERATED_MARKER}.` : `${GENERATED_MARKER}. Do not edit.`
  const content = new TextDecoder().decode(bytes)
  return content.startsWith('<?xml')
    ? content.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n<!-- ${marker} -->\n`)
    : `<!-- ${marker} -->\n${content}`
}

function description(config: ResolvedSpriteConfig): string[] {
  const text = config.description ?? `Icon names for the "${config.name}" SVG sprite.`
  return ['/**', ...text.split(/\r?\n/).map((line) => ` * ${line.replace(/\*\//g, '* /')}`), ' */']
}

function iconData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const prefix = camel(config.name)
  const names = artifact.icons.map((icon) => icon.name)
  const ids = Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id]))
  return [
    header(config.generatedNotice),
    '',
    ...description(config),
    `export const ${prefix}IconNames = ${JSON.stringify(names, null, 2)}`,
    '',
    `export const ${prefix}IconIds = ${JSON.stringify(ids, null, 2)}`,
    '',
  ].join('\n')
}

function iconTypes(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const typeName = `${pascal(config.name)}IconName`
  const names = `${camel(config.name)}IconNames`
  const ids = `${camel(config.name)}IconIds`
  return [
    header(config.generatedNotice),
    '',
    ...description(config),
    `export declare const ${names}: readonly [`,
    ...artifact.icons.map((icon) => `  ${JSON.stringify(icon.name)},`),
    ']',
    `export type ${typeName} = typeof ${names}[number]`,
    `export declare const ${ids}: {`,
    ...artifact.icons.map((icon) => `  readonly ${JSON.stringify(icon.name)}: ${JSON.stringify(icon.id)}`),
    '}',
    '',
  ].join('\n')
}

function integration(config: ResolvedSpriteConfig): string {
  const prefix = camel(config.name)
  const directive = `${config.name}-icon`
  const magic = `${prefix}IconHref`
  const className = `${config.name}-icon`
  const styleId = `svg-sprites-${config.name}-alpine`
  return [
    header(config.generatedNotice),
    "import integrationStyles from './alpine-integration.css?inline'",
    `import { ${prefix}IconIds } from '../icon-data.js'`,
    "import spriteUrl from '../sprite.svg?no-inline'",
    '',
    `export const ${prefix}IconDirective = ${JSON.stringify(directive)}`,
    `export const ${prefix}IconMagic = ${JSON.stringify(magic)}`,
    '',
    'function iconHref(icon) {',
    `  const id = ${prefix}IconIds[icon]`,
    "  return id ? spriteUrl + '#' + id : ''",
    '}',
    '',
    'function installStyles() {',
    `  if (document.getElementById(${JSON.stringify(styleId)})) return`,
    "  const style = document.createElement('style')",
    `  style.id = ${JSON.stringify(styleId)}`,
    '  style.textContent = integrationStyles',
    '  document.head.append(style)',
    '}',
    '',
    `export const ${prefix}AlpinePlugin = (Alpine) => {`,
    '  installStyles()',
    `  Alpine.magic(${prefix}IconMagic, () => iconHref)`,
    '',
    `  Alpine.directive(${prefix}IconDirective, (element, { expression }, { effect, evaluateLater }) => {`,
    "    if (element.namespaceURI !== 'http://www.w3.org/2000/svg' || element.localName !== 'svg') {",
    `      throw new Error('x-${directive} must be used on an <svg> element.')`,
    '    }',
    '',
    `    element.classList.add(${JSON.stringify(className)})`,
    "    let use = Array.from(element.children).find((child) => child.localName === 'use' && child.hasAttribute('data-svg-sprites-icon'))",
    '    if (!use) {',
    "      use = document.createElementNS('http://www.w3.org/2000/svg', 'use')",
    "      use.setAttribute('data-svg-sprites-icon', '')",
    '      element.append(use)',
    '    }',
    '',
    '    const evaluateIcon = evaluateLater(expression)',
    '    effect(() => {',
    '      evaluateIcon((icon) => {',
    '        const href = iconHref(icon)',
    "        if (href) use.setAttribute('href', href)",
    "        else use.removeAttribute('href')",
    '      })',
    '    })',
    '  })',
    '}',
    '',
  ].join('\n')
}

function integrationTypes(config: ResolvedSpriteConfig): string {
  const pascalName = pascal(config.name)
  const prefix = camel(config.name)
  const typeName = `${pascalName}IconName`
  return [
    header(config.generatedNotice),
    '',
    `export type ${pascalName}AlpineDirectiveUtilities = {`,
    '  effect(callback: () => void): void',
    '  evaluateLater(expression: string): (receiver: (value: unknown) => void) => void',
    '}',
    `export type ${pascalName}AlpineApi = {`,
    '  magic(name: string, callback: () => unknown): unknown',
    `  directive(name: string, callback: (element: Element, directive: { expression: string }, utilities: ${pascalName}AlpineDirectiveUtilities) => void): unknown`,
    '}',
    `export type ${pascalName}AlpinePluginType = (Alpine: ${pascalName}AlpineApi) => void`,
    `export declare const ${prefix}IconDirective: ${JSON.stringify(`${config.name}-icon`)}`,
    `export declare const ${prefix}IconMagic: ${JSON.stringify(`${prefix}IconHref`)}`,
    `export declare const ${prefix}AlpinePlugin: ${pascalName}AlpinePluginType`,
    `export type { ${typeName} } from '../icon-data.js'`,
    '',
  ].join('\n')
}

function styles(config: ResolvedSpriteConfig): string {
  const transition = config.transform.addTransition
    ? ['  transition-property: fill, stroke, color;', '  transition-duration: 0.3s;', '  transition-timing-function: ease;']
    : []
  return [
    header(config.generatedNotice),
    '',
    `.${config.name}-icon {`,
    '  display: inline-block;',
    '  width: 1em;',
    '  height: 1em;',
    '  vertical-align: middle;',
    ...transition,
    '}',
    '',
  ].join('\n')
}

function index(config: ResolvedSpriteConfig): string {
  const prefix = camel(config.name)
  return [
    header(config.generatedNotice),
    `export { ${prefix}AlpinePlugin, ${prefix}IconDirective, ${prefix}IconMagic } from './alpine/alpine-integration.js'`,
    `export { ${prefix}IconNames } from './icon-data.js'`,
    '',
  ].join('\n')
}

function indexTypes(config: ResolvedSpriteConfig): string {
  const pascalName = pascal(config.name)
  const prefix = camel(config.name)
  return [
    header(config.generatedNotice),
    `export { ${prefix}AlpinePlugin, ${prefix}IconDirective, ${prefix}IconMagic } from './alpine/alpine-integration.js'`,
    `export type { ${pascalName}AlpineApi, ${pascalName}AlpineDirectiveUtilities, ${pascalName}AlpinePluginType } from './alpine/alpine-integration.js'`,
    `export { ${prefix}IconNames } from './icon-data.js'`,
    `export type { ${pascalName}IconName } from './icon-data.js'`,
    '',
  ].join('\n')
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const prefix = camel(config.name)
  const data = {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    usage: {
      framework: 'alpine',
      pluginName: `${prefix}AlpinePlugin`,
      directive: `x-${config.name}-icon`,
      magic: `$${prefix}IconHref`,
    },
    mode: MODE,
    target: TARGET,
    format: artifact.format,
    iconCount: artifact.icons.length,
    spriteUrl: '__SPRITE_URL__',
    icons: artifact.icons,
  }
  const source = JSON.stringify(data, null, 2).replace('"__SPRITE_URL__"', 'spriteUrl')
  return [
    header(config.generatedNotice),
    "import spriteUrl from './sprite.svg?no-inline'",
    '',
    `export const spriteManifest = ${source}`,
    '',
    'export default spriteManifest',
    '',
  ].join('\n')
}

function manifestTypes(config: ResolvedSpriteConfig): string {
  return [
    header(config.generatedNotice),
    '',
    'export type SpriteManifestColor = { variable: `--icon-color-${number}`; fallback: string }',
    'export type SpriteManifestIcon = {',
    '  name: string',
    '  id: string',
    '  viewBox: string | null',
    '  colors: readonly SpriteManifestColor[]',
    '}',
    'export type SpriteManifest = {',
    '  schemaVersion: 1',
    "  generator: '@gromlab/svg-sprites'",
    '  name: string',
    '  description?: string',
    "  usage: { framework: 'alpine'; pluginName: string; directive: string; magic: string }",
    "  mode: 'alpine@vite'",
    "  target: 'vite'",
    "  format: 'stack' | 'symbol'",
    '  iconCount: number',
    '  spriteUrl: string',
    '  icons: readonly SpriteManifestIcon[]',
    '}',
    'export declare const spriteManifest: SpriteManifest',
    'export default spriteManifest',
    '',
  ].join('\n')
}

export function generateOutputFiles(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): GeneratedFile[] {
  return [
    { path: path.posix.join(OUTPUT_DIR, 'index.js'), content: index(config) },
    { path: path.posix.join(OUTPUT_DIR, 'index.d.ts'), content: indexTypes(config) },
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: markedSvg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconTypes(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'alpine', 'alpine-integration.js'), content: integration(config) },
    { path: path.posix.join(OUTPUT_DIR, 'alpine', 'alpine-integration.d.ts'), content: integrationTypes(config) },
    { path: path.posix.join(OUTPUT_DIR, 'alpine', 'alpine-integration.css'), content: styles(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestTypes(config) },
  ]
}
