import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'next@pages/webpack'
const OUTPUT_DIR = '.svg-sprite'
const NOTICE = 'АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. Не редактируйте вручную.'
const pascal = (value: string) => value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
const camel = (value: string) => value.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
const header = (enabled: boolean) => enabled ? `/*\n * ${NOTICE}\n * ${GENERATED_MARKER}.\n */` : `/* ${GENERATED_MARKER}. Do not edit. */`

function markedSvg(bytes: Uint8Array, enabled: boolean): string {
  const marker = enabled ? `${NOTICE}\n  ${GENERATED_MARKER}.` : `${GENERATED_MARKER}. Do not edit.`
  const content = new TextDecoder().decode(bytes)
  return content.startsWith('<?xml') ? content.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n<!-- ${marker} -->\n`) : `<!-- ${marker} -->\n${content}`
}

function docs(config: ResolvedSpriteConfig): string[] {
  const text = config.description ?? `Имена иконок SVG-спрайта «${config.name}».`
  return ['/**', ...text.split(/\r?\n/).map((line) => ` * ${line.replace(/\*\//g, '* /')}`), ' */']
}

function iconData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const prefix = camel(config.name)
  return [header(config.generatedNotice), '', ...docs(config), `export const ${prefix}IconNames = ${JSON.stringify(artifact.icons.map((icon) => icon.name), null, 2)}`, '', `export const ${prefix}IconIds = ${JSON.stringify(Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id])), null, 2)}`, ''].join('\n')
}

function component(config: ResolvedSpriteConfig): string {
  const name = `${pascal(config.name)}Icon`
  const ids = `${camel(config.name)}IconIds`
  return [header(config.generatedNotice), "import { jsx } from 'react/jsx-runtime'", "import styles from './react-component.module.css'", `import { ${ids} } from '../icon-data.js'`, '', "const spriteUrl = new URL('../sprite.svg', import.meta.url).href", '', `export const ${name} = (props) => {`, '  const { icon, wrapped, className, ...rest } = props', `  const href = spriteUrl + '#' + ${ids}[icon]`, '  if (wrapped) {', "    return jsx('span', {", '      ...rest,', "      className: [styles.wrap, className].filter(Boolean).join(' '),", "      children: jsx('svg', { children: jsx('use', { href }) }),", '    })', '  }', "  return jsx('svg', {", '    ...rest,', "    className: [styles.root, className].filter(Boolean).join(' '),", "    children: jsx('use', { href }),", '  })', '}', ''].join('\n')
}

function iconDeclarations(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const componentName = `${pascal(config.name)}Icon`
  const typeName = `${componentName}Name`
  const names = `${camel(config.name)}IconNames`
  const ids = `${camel(config.name)}IconIds`
  return [header(config.generatedNotice), '', ...docs(config), `export declare const ${names}: readonly [`, ...artifact.icons.map((icon) => `  ${JSON.stringify(icon.name)},`), ']', `export type ${typeName} = typeof ${names}[number]`, `export declare const ${ids}: {`, ...artifact.icons.map((icon) => `  readonly ${JSON.stringify(icon.name)}: ${JSON.stringify(icon.id)}`), '}', ''].join('\n')
}

function componentDeclarations(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  const typeName = `${componentName}Name`
  const styleName = `${componentName}Style`
  const propsName = `${componentName}Props`
  return [header(config.generatedNotice), "import type { CSSProperties, HTMLAttributes, ReactElement, SVGAttributes } from 'react'", `import type { ${typeName} } from '../icon-data.js'`, '', `export type ${styleName} = CSSProperties & Partial<Record<\`--icon-color-\${number}\`, string | number>>`, `type ${componentName}BaseProps = { icon: ${typeName} }`, `type ${componentName}SvgProps = ${componentName}BaseProps & { wrapped?: false } & Omit<SVGAttributes<SVGSVGElement>, 'style'> & { style?: ${styleName} }`, `type ${componentName}WrappedProps = ${componentName}BaseProps & { wrapped: true } & Omit<HTMLAttributes<HTMLSpanElement>, 'style'> & { style?: ${styleName} }`, `export type ${propsName} = ${componentName}SvgProps | ${componentName}WrappedProps`, `export declare const ${componentName}: (props: ${propsName}) => ReactElement`, ''].join('\n')
}

function indexDeclarations(config: ResolvedSpriteConfig): string {
  const componentName = `${pascal(config.name)}Icon`
  const names = `${camel(config.name)}IconNames`
  return [header(config.generatedNotice), `export { ${componentName} } from './react/react-component.js'`, `export type { ${componentName}Props, ${componentName}Style } from './react/react-component.js'`, `export { ${names} } from './icon-data.js'`, `export type { ${componentName}Name } from './icon-data.js'`, ''].join('\n')
}

function index(config: ResolvedSpriteConfig): string {
  return [header(config.generatedNotice), `export { ${pascal(config.name)}Icon } from './react/react-component.js'`, `export { ${camel(config.name)}IconNames } from './icon-data.js'`, ''].join('\n')
}

function styles(config: ResolvedSpriteConfig): string {
  const transition = config.transform.addTransition ? ['  transition-property: fill, stroke, color;', '  transition-duration: 0.3s;', '  transition-timing-function: ease;'] : []
  return [header(config.generatedNotice), '', '.root {', ...transition, '}', '', '.wrap {', '  display: inline-flex;', '}', '', '.wrap svg {', '  width: 100%;', '  height: 100%;', ...transition, '}', ''].join('\n')
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const data = { schemaVersion: 1, generator: '@gromlab/svg-sprites', name: config.name, ...(config.description === undefined ? {} : { description: config.description }), componentName: `${pascal(config.name)}Icon`, mode: MODE, target: MODE, format: artifact.format, iconCount: artifact.icons.length, spriteUrl: '__SPRITE_URL__', icons: artifact.icons }
  const source = JSON.stringify(data, null, 2).replace('"__SPRITE_URL__"', 'spriteUrl')
  return [header(config.generatedNotice), "const spriteUrl = new URL('./sprite.svg', import.meta.url).href", '', `export const spriteManifest = ${source}`, '', 'export default spriteManifest', ''].join('\n')
}

const manifestTypes = (config: ResolvedSpriteConfig) => [
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
  'export type SpriteManifest = {',
  '  schemaVersion: 1',
  "  generator: '@gromlab/svg-sprites'",
  '  name: string',
  '  description?: string',
  '  componentName: string',
  "  mode: 'next@pages/webpack'",
  "  target: 'next@pages/webpack'",
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

export function generateOutputFiles(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): GeneratedFile[] {
  return [
    { path: path.posix.join(OUTPUT_DIR, 'index.js'), content: index(config) },
    { path: path.posix.join(OUTPUT_DIR, 'index.d.ts'), content: indexDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: markedSvg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconDeclarations(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'react', 'react-component.js'), content: component(config) },
    { path: path.posix.join(OUTPUT_DIR, 'react', 'react-component.d.ts'), content: componentDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'react', 'react-component.module.css'), content: styles(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestTypes(config) },
  ]
}
