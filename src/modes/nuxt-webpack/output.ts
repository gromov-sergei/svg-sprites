import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'nuxt@webpack'
const TARGET = 'webpack'
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
  const marker = enabled ? `${NOTICE}\n  ${GENERATED_MARKER}.` : `${GENERATED_MARKER}. Do not edit.`
  const content = new TextDecoder().decode(bytes)
  return content.startsWith('<?xml')
    ? content.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n<!-- ${marker} -->\n`)
    : `<!-- ${marker} -->\n${content}`
}

function docs(config: ResolvedSpriteConfig): string[] {
  const text = config.description ?? `SVG sprite icon names for "${config.name}".`
  return ['/**', ...text.split(/\r?\n/).map((line) => ` * ${line.replace(/\*\//g, '* /')}`), ' */']
}

function iconData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const prefix = camel(config.name)
  const names = artifact.icons.map((icon) => icon.name)
  const ids = Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id]))
  return [
    header(config.generatedNotice),
    '',
    ...docs(config),
    `export const ${prefix}IconNames = ${JSON.stringify(names, null, 2)}`,
    '',
    `export const ${prefix}IconIds = ${JSON.stringify(ids, null, 2)}`,
    '',
  ].join('\n')
}

function component(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  const ids = `${camel(config.name)}IconIds`
  return [
    header(config.generatedNotice),
    "import { defineComponent, h } from 'vue'",
    "import styles from './vue-component.module.css'",
    `import { ${ids} } from '../icon-data.js'`,
    "import spriteUrl from '../sprite.svg'",
    '',
    `export const ${componentName} = defineComponent({`,
    `  name: '${componentName}',`,
    '  inheritAttrs: false,',
    '  props: {',
    "    icon: { type: String, required: true },",
    "    wrapped: { type: Boolean, default: false },",
    '  },',
    '  setup(props, { attrs }) {',
    '    return () => {',
    `      const href = spriteUrl + '#' + ${ids}[props.icon]`,
    '      if (props.wrapped) {',
    "        return h('span', { ...attrs, class: [styles.wrap, attrs.class] }, [",
    "          h('svg', null, [h('use', { href })]),",
    '        ])',
    '      }',
    "      return h('svg', { ...attrs, class: [styles.root, attrs.class] }, [",
    "        h('use', { href }),",
    '      ])',
    '    }',
    '  },',
    '})',
    '',
  ].join('\n')
}

function iconDeclarations(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const componentName = `${pascal(config.name)}Icon`
  const names = `${camel(config.name)}IconNames`
  const ids = `${camel(config.name)}IconIds`
  return [
    header(config.generatedNotice),
    '',
    ...docs(config),
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
    header(config.generatedNotice),
    "import type { CSSProperties, DefineComponent, HTMLAttributes, SVGAttributes } from 'vue'",
    `import type { ${componentName}Name } from '../icon-data.js'`,
    '',
    `export type ${componentName}Style = CSSProperties & Partial<Record<\`--icon-color-\${number}\`, string | number>>`,
    `type ${componentName}BaseProps = { icon: ${componentName}Name }`,
    `type ${componentName}SvgProps = ${componentName}BaseProps & { wrapped?: false } & Omit<SVGAttributes, 'style'> & { style?: ${componentName}Style }`,
    `type ${componentName}WrappedProps = ${componentName}BaseProps & { wrapped: true } & Omit<HTMLAttributes, 'style'> & { style?: ${componentName}Style }`,
    `export type ${componentName}Props = ${componentName}SvgProps | ${componentName}WrappedProps`,
    `export declare const ${componentName}: DefineComponent<${componentName}Props>`,
    '',
  ].join('\n')
}

function index(config: ResolvedSpriteConfig): string {
  return [
    header(config.generatedNotice),
    `export { ${pascal(config.name)}Icon } from './vue/vue-component.js'`,
    `export { ${camel(config.name)}IconNames } from './icon-data.js'`,
    '',
  ].join('\n')
}

function indexDeclarations(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  const names = `${camel(config.name)}IconNames`
  return [
    header(config.generatedNotice),
    `export { ${componentName} } from './vue/vue-component.js'`,
    `export type { ${componentName}Props, ${componentName}Style } from './vue/vue-component.js'`,
    `export { ${names} } from './icon-data.js'`,
    `export type { ${componentName}Name } from './icon-data.js'`,
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
    '.root {',
    ...transition,
    '}',
    '',
    '.wrap {',
    '  display: inline-flex;',
    '}',
    '',
    '.wrap svg {',
    '  width: 100%;',
    '  height: 100%;',
    ...transition,
    '}',
    '',
  ].join('\n')
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const data = {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    usage: { framework: 'vue', componentName: `${pascal(config.name)}Icon` },
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
    "import spriteUrl from './sprite.svg'",
    '',
    `export const spriteManifest = ${source}`,
    '',
    'export default spriteManifest',
    '',
  ].join('\n')
}

function manifestDeclarations(config: ResolvedSpriteConfig): string {
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
    "  usage: { framework: 'vue'; componentName: string }",
    "  mode: 'nuxt@webpack'",
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
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: markedSvg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconDeclarations(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'vue', 'vue-component.js'), content: component(config) },
    { path: path.posix.join(OUTPUT_DIR, 'vue', 'vue-component.d.ts'), content: componentDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'vue', 'vue-component.module.css'), content: styles(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestDeclarations(config) },
  ]
}
