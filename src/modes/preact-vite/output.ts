import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const OUTPUT_DIR = '.svg-sprite'

function pascal(value: string): string {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function camel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function header(enabled: boolean): string {
  return enabled
    ? `/*\n * АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. Не редактируйте вручную.\n * ${GENERATED_MARKER}.\n */`
    : `/* ${GENERATED_MARKER}. Do not edit. */`
}

function svg(bytes: Uint8Array, enabled: boolean): string {
  const notice = enabled
    ? `АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. ${GENERATED_MARKER}.`
    : `${GENERATED_MARKER}. Do not edit.`
  const content = new TextDecoder().decode(bytes)
  return content.startsWith('<?xml')
    ? content.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n<!-- ${notice} -->\n`)
    : `<!-- ${notice} -->\n${content}`
}

function description(config: ResolvedSpriteConfig): string[] {
  const text = config.description ?? `Имена иконок SVG-спрайта «${config.name}».`
  return ['/**', ...text.split(/\r?\n/).map((line) => ` * ${line.replace(/\*\//g, '* /')}`), ' */']
}

function iconData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const name = camel(config.name)
  return [
    header(config.generatedNotice),
    '',
    ...description(config),
    `export const ${name}IconNames = ${JSON.stringify(artifact.icons.map((icon) => icon.name), null, 2)}`,
    '',
    `export const ${name}IconIds = ${JSON.stringify(Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id])), null, 2)}`,
    '',
  ].join('\n')
}

function iconTypes(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const component = `${pascal(config.name)}Icon`
  const names = `${camel(config.name)}IconNames`
  const ids = `${camel(config.name)}IconIds`
  return [
    header(config.generatedNotice),
    '',
    ...description(config),
    `export declare const ${names}: readonly [`,
    ...artifact.icons.map((icon) => `  ${JSON.stringify(icon.name)},`),
    ']',
    `export type ${component}Name = typeof ${names}[number]`,
    `export declare const ${ids}: {`,
    ...artifact.icons.map((icon) => `  readonly ${JSON.stringify(icon.name)}: ${JSON.stringify(icon.id)}`),
    '}',
    '',
  ].join('\n')
}

function component(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  const ids = `${camel(config.name)}IconIds`
  return [
    header(config.generatedNotice),
    "import { h } from 'preact'",
    "import styles from './preact-component.module.css'",
    `import { ${ids} } from '../icon-data.js'`,
    "import spriteUrl from '../sprite.svg?no-inline'",
    '',
    `/** Иконка из SVG-спрайта «${config.name}». */`,
    `export const ${componentName} = (props) => {`,
    '  const { icon, wrapped, class: classValue, className, ...rest } = props',
    `  const href = spriteUrl + '#' + ${ids}[icon]`,
    '  const classes = [wrapped ? styles.wrap : styles.root, classValue, className].filter(Boolean).join(\' \')',
    '',
    '  if (wrapped) {',
    "    return h('span', { ...rest, class: classes }, h('svg', null, h('use', { href })))",
    '  }',
    "  return h('svg', { ...rest, class: classes }, h('use', { href }))",
    '}',
    '',
  ].join('\n')
}

function componentTypes(config: ResolvedSpriteConfig): string {
  const component = `${pascal(config.name)}Icon`
  return [
    header(config.generatedNotice),
    "import type { FunctionalComponent, JSX } from 'preact'",
    `import type { ${component}Name } from '../icon-data.js'`,
    '',
    `export type ${component}Style = JSX.CSSProperties & Partial<Record<\`--icon-color-\${number}\`, string | number>>`,
    `type ${component}BaseProps = { icon: ${component}Name }`,
    `type ${component}SvgProps = ${component}BaseProps & { wrapped?: false } & Omit<JSX.SVGAttributes<SVGSVGElement>, 'style'> & { style?: ${component}Style }`,
    `type ${component}WrappedProps = ${component}BaseProps & { wrapped: true } & Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'style'> & { style?: ${component}Style }`,
    `export type ${component}Props = ${component}SvgProps | ${component}WrappedProps`,
    `export declare const ${component}: FunctionalComponent<${component}Props>`,
    '',
  ].join('\n')
}

function index(config: ResolvedSpriteConfig): string {
  return [
    header(config.generatedNotice),
    `export { ${pascal(config.name)}Icon } from './preact/preact-component.js'`,
    `export { ${camel(config.name)}IconNames } from './icon-data.js'`,
    '',
  ].join('\n')
}

function indexTypes(config: ResolvedSpriteConfig): string {
  const component = `${pascal(config.name)}Icon`
  return [
    header(config.generatedNotice),
    `export { ${component} } from './preact/preact-component.js'`,
    `export type { ${component}Props, ${component}Style } from './preact/preact-component.js'`,
    `export { ${camel(config.name)}IconNames } from './icon-data.js'`,
    `export type { ${component}Name } from './icon-data.js'`,
    '',
  ].join('\n')
}

function styles(config: ResolvedSpriteConfig): string {
  const transition = config.transform.addTransition
    ? ['  transition-property: fill, stroke, color;', '  transition-duration: 0.3s;', '  transition-timing-function: ease;']
    : []
  return [header(config.generatedNotice), '', '.root {', ...transition, '}', '', '.wrap {', '  display: inline-flex;', '}', '', '.wrap svg {', '  width: 100%;', '  height: 100%;', ...transition, '}', ''].join('\n')
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const data = {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    usage: { framework: 'preact', componentName: `${pascal(config.name)}Icon` },
    mode: 'preact@vite',
    target: 'vite',
    format: artifact.format,
    iconCount: artifact.icons.length,
    spriteUrl: '__SPRITE_URL__',
    icons: artifact.icons,
  }
  const source = JSON.stringify(data, null, 2).replace('"__SPRITE_URL__"', 'spriteUrl')
  return [header(config.generatedNotice), "import spriteUrl from './sprite.svg?no-inline'", '', `export const spriteManifest = ${source}`, '', 'export default spriteManifest', ''].join('\n')
}

function manifestTypes(config: ResolvedSpriteConfig): string {
  return [
    header(config.generatedNotice),
    'export type SpriteManifestColor = { variable: `--icon-color-${number}`; fallback: string }',
    'export type SpriteManifestIcon = { name: string; id: string; viewBox: string | null; colors: readonly SpriteManifestColor[] }',
    'export type SpriteManifest = {',
    "  schemaVersion: 1; generator: '@gromlab/svg-sprites'; name: string; description?: string",
    "  usage: { framework: 'preact'; componentName: string }",
    "  mode: 'preact@vite'; target: 'vite'; format: 'stack' | 'symbol'",
    '  iconCount: number; spriteUrl: string; icons: readonly SpriteManifestIcon[]',
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
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: svg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconTypes(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'preact', 'preact-component.js'), content: component(config) },
    { path: path.posix.join(OUTPUT_DIR, 'preact', 'preact-component.d.ts'), content: componentTypes(config) },
    { path: path.posix.join(OUTPUT_DIR, 'preact', 'preact-component.module.css'), content: styles(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestTypes(config) },
  ]
}
