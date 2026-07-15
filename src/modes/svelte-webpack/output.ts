import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'svelte@webpack'
const TARGET = 'webpack'
const OUTPUT_DIR = '.svg-sprite'
const NOTICE = 'АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. Не редактируйте вручную.'

function pascal(value: string): string {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function camel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function jsHeader(enabled: boolean): string {
  return enabled
    ? `/*\n * ${NOTICE}\n * ${GENERATED_MARKER}.\n */`
    : `/* ${GENERATED_MARKER}. Do not edit. */`
}

function markupHeader(enabled: boolean): string {
  return enabled
    ? `<!-- ${NOTICE}\n  ${GENERATED_MARKER}. -->`
    : `<!-- ${GENERATED_MARKER}. Do not edit. -->`
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
    jsHeader(config.generatedNotice),
    '',
    ...description(config),
    `export const ${prefix}IconNames = ${JSON.stringify(artifact.icons.map((icon) => icon.name), null, 2)}`,
    '',
    `export const ${prefix}IconIds = ${JSON.stringify(Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id])), null, 2)}`,
    '',
  ].join('\n')
}

function component(config: ResolvedSpriteConfig): string {
  const ids = `${camel(config.name)}IconIds`
  const transition = config.transform.addTransition
    ? ['    transition-property: fill, stroke, color;', '    transition-duration: 0.3s;', '    transition-timing-function: ease;']
    : []
  return [
    markupHeader(config.generatedNotice),
    '<script>',
    `  import { ${ids} } from '../icon-data.js'`,
    '',
    "  const spriteUrl = new URL('../sprite.svg', import.meta.url).href",
    '  let { icon, wrapped = false, class: className, ...attributes } = $props()',
    `  const href = $derived(spriteUrl + '#' + ${ids}[icon])`,
    '</script>',
    '',
    '{#if wrapped}',
    '  <span {...attributes} class={["wrap", className]}><svg aria-hidden="true"><use {href}></use></svg></span>',
    '{:else}',
    '  <svg {...attributes} class={["root", className]}><use {href}></use></svg>',
    '{/if}',
    '',
    '<style>',
    '  .root {',
    ...transition,
    '  }',
    '',
    '  .wrap {',
    '    display: inline-flex;',
    '  }',
    '',
    '  .wrap svg {',
    '    width: 100%;',
    '    height: 100%;',
    ...transition,
    '  }',
    '</style>',
    '',
  ].join('\n')
}

function iconDeclarations(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const componentName = `${pascal(config.name)}Icon`
  const names = `${camel(config.name)}IconNames`
  const ids = `${camel(config.name)}IconIds`
  return [
    jsHeader(config.generatedNotice),
    '',
    ...description(config),
    `export declare const ${names}: readonly [`,
    ...artifact.icons.map((icon) => `  ${JSON.stringify(icon.name)},`),
    ']',
    `export type ${componentName}Name = typeof ${names}[number]`,
    `export declare const ${ids}: {`,
    ...artifact.icons.map((icon) => `  readonly ${JSON.stringify(icon.name)}: ${JSON.stringify(icon.id)}`),
    '}',
    '',
  ].join('\n')
}

function componentDeclarations(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  return [
    jsHeader(config.generatedNotice),
    "import type { Component } from 'svelte'",
    "import type { ClassValue, HTMLAttributes, SVGAttributes } from 'svelte/elements'",
    `import type { ${componentName}Name } from '../icon-data.js'`,
    '',
    `export type ${componentName}Style = string`,
    `type ${componentName}BaseProps = { icon: ${componentName}Name; class?: ClassValue; style?: ${componentName}Style }`,
    `type ${componentName}SvgProps = ${componentName}BaseProps & { wrapped?: false } & Omit<SVGAttributes<SVGSVGElement>, 'class' | 'style'>`,
    `type ${componentName}WrappedProps = ${componentName}BaseProps & { wrapped: true } & Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'style'>`,
    `export type ${componentName}Props = ${componentName}SvgProps | ${componentName}WrappedProps`,
    `declare const ${componentName}: Component<${componentName}Props>`,
    `export default ${componentName}`,
    '',
  ].join('\n')
}

function index(config: ResolvedSpriteConfig): string {
  return [
    jsHeader(config.generatedNotice),
    `export { default as ${pascal(config.name)}Icon } from './svelte/svelte-component.svelte'`,
    `export { ${camel(config.name)}IconNames } from './icon-data.js'`,
    '',
  ].join('\n')
}

function indexDeclarations(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  return [
    jsHeader(config.generatedNotice),
    `export { default as ${componentName} } from './svelte/svelte-component.svelte'`,
    `export type { ${componentName}Props, ${componentName}Style } from './svelte/svelte-component.svelte'`,
    `export { ${camel(config.name)}IconNames } from './icon-data.js'`,
    `export type { ${componentName}Name } from './icon-data.js'`,
    '',
  ].join('\n')
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const data = {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    usage: { framework: 'svelte', componentName: `${pascal(config.name)}Icon` },
    mode: MODE,
    target: TARGET,
    format: artifact.format,
    iconCount: artifact.icons.length,
    spriteUrl: '__SPRITE_URL__',
    icons: artifact.icons,
  }
  const source = JSON.stringify(data, null, 2).replace('"__SPRITE_URL__"', 'spriteUrl')
  return [
    jsHeader(config.generatedNotice),
    "const spriteUrl = new URL('./sprite.svg', import.meta.url).href",
    '',
    `export const spriteManifest = ${source}`,
    '',
    'export default spriteManifest',
    '',
  ].join('\n')
}

function manifestDeclarations(config: ResolvedSpriteConfig): string {
  return [
    jsHeader(config.generatedNotice),
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
    'export type SpriteManifest = {',
    '  schemaVersion: 1',
    "  generator: '@gromlab/svg-sprites'",
    '  name: string',
    '  description?: string',
    "  usage: { framework: 'svelte'; componentName: string }",
    "  mode: 'svelte@webpack'",
    "  target: 'webpack'",
    "  format: 'stack' | 'symbol'",
    '  iconCount: number',
    '  spriteUrl: string',
    '  icons: readonly SpriteManifestIcon[]',
    '}',
    '',
    'export declare const spriteManifest: SpriteManifest',
    'export default spriteManifest',
    '',
  ].join('\n')
}

export function generateOutputFiles(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): GeneratedFile[] {
  return [
    { path: path.posix.join(OUTPUT_DIR, 'index.js'), content: index(config) },
    { path: path.posix.join(OUTPUT_DIR, 'index.d.ts'), content: indexDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: svg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconDeclarations(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svelte', 'svelte-component.svelte'), content: component(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svelte', 'svelte-component.svelte.d.ts'), content: componentDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestDeclarations(config) },
  ]
}
