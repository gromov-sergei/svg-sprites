import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'standalone@vite'
const TARGET = 'vite'
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

function index(config: ResolvedSpriteConfig): string {
  const prefix = camel(config.name)
  const pascalName = pascal(config.name)
  return [
    header(config.generatedNotice),
    "import spriteUrl from './sprite.svg?no-inline'",
    `import { ${prefix}IconIds, ${prefix}IconNames } from './icon-data.js'`,
    '',
    `export { ${prefix}IconIds, ${prefix}IconNames }`,
    `export const ${prefix}SpriteUrl = spriteUrl`,
    `export function get${pascalName}IconHref(icon) {`,
    `  return ${prefix}SpriteUrl + '#' + ${prefix}IconIds[icon]`,
    '}',
    '',
  ].join('\n')
}

function indexDeclarations(config: ResolvedSpriteConfig): string {
  const prefix = camel(config.name)
  const pascalName = pascal(config.name)
  return [
    header(config.generatedNotice),
    `import type { ${pascalName}IconName } from './icon-data.js'`,
    '',
    `export { ${prefix}IconIds, ${prefix}IconNames } from './icon-data.js'`,
    `export type { ${pascalName}IconName } from './icon-data.js'`,
    `export declare const ${prefix}SpriteUrl: string`,
    `export declare function get${pascalName}IconHref(icon: ${pascalName}IconName): string`,
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
    "import spriteUrl from './sprite.svg?no-inline'",
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
    "import type { StandaloneSpriteManifest, StandaloneSpriteManifestData } from '@gromlab/svg-sprites'",
    '',
    "export declare const spriteManifestData: StandaloneSpriteManifestData<'standalone@vite'>",
    "export declare function createSpriteManifest(spriteUrl: string): StandaloneSpriteManifest<'standalone@vite'>",
    "export declare const spriteManifest: StandaloneSpriteManifest<'standalone@vite'>",
    'export default spriteManifest',
    '',
  ].join('\n')
}

export function generateOutputFiles(
  config: ResolvedSpriteConfig,
  artifact: CompiledSpriteArtifact,
): GeneratedFile[] {
  return [
    { path: path.posix.join(OUTPUT_DIR, 'index.js'), content: index(config) },
    { path: path.posix.join(OUTPUT_DIR, 'index.d.ts'), content: indexDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: svg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: iconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: iconDeclarations(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: manifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: manifestTypes(config) },
  ]
}
