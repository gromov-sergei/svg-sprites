import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'react@vite'
const TARGET = 'vite'
const OUTPUT_DIR = '.svg-sprite'
const GENERATED_NOTICE = [
  '----------------------------------------------------------------------',
  '## АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ                               ##',
  '##                                                                  ##',
  '## Не редактируйте вручную: изменения будут перезаписаны.           ##',
  '## Для изменений перегенерируйте SVG-спрайт.                        ##',
  '##                                                                  ##',
  '## Генератор: @gromlab/svg-sprites                                  ##',
  '## Репозиторий: https://github.com/gromlab-ru/svg-sprites            ##',
  '----------------------------------------------------------------------',
]

function toPascalCase(value: string): string {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function toCamelCase(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function blockHeader(enabled: boolean): string {
  if (!enabled) return `/* ${GENERATED_MARKER}. Do not edit. */`
  return ['/*', ...GENERATED_NOTICE.map((line) => ` * ${line}`), ' */'].join('\n')
}

function svgHeader(enabled: boolean): string {
  if (!enabled) return `<!-- ${GENERATED_MARKER}. Do not edit. -->`
  return ['<!--', ...GENERATED_NOTICE.slice(1, -1).map((line) => `  ${line}`), '-->'].join('\n')
}

function formatSvg(content: string): string {
  let depth = 0
  const lines = content.replace(/></g, '>\n<').split('\n')
  const formatted = lines.map((line) => {
    const trimmed = line.trim()
    const tags = trimmed.match(/<[^>]+>/g) ?? []
    const startsWithClosingTag = trimmed.startsWith('</')
    if (startsWithClosingTag) depth = Math.max(0, depth - 1)
    const formattedLine = `${'  '.repeat(depth)}${trimmed}`

    for (const tag of tags) {
      if (tag.startsWith('</')) {
        if (!startsWithClosingTag) depth = Math.max(0, depth - 1)
      } else if (!tag.startsWith('<?') && !tag.startsWith('<!') && !tag.endsWith('/>')) {
        depth += 1
      }
    }
    return formattedLine
  })
  return `${formatted.join('\n')}\n`
}

function markedSvg(bytes: Uint8Array, notice: boolean): string {
  const svg = formatSvg(new TextDecoder().decode(bytes))
  const header = svgHeader(notice)
  return svg.startsWith('<?xml')
    ? svg.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n${header}\n`)
    : `${header}\n${svg}`
}

function descriptionComment(name: string, description?: string): string[] {
  const text = description ?? `Имена иконок SVG-спрайта «${name}».`
  return ['/**', ...text.split(/\r?\n/).map((line) => ` * ${line.replace(/\*\//g, '* /')}`), ' */']
}

function generateIconData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const camelName = toCamelCase(config.name)
  const names = artifact.icons.map((icon) => icon.name)
  const ids = Object.fromEntries(artifact.icons.map((icon) => [icon.name, icon.id]))
  return [
    blockHeader(config.generatedNotice),
    '',
    ...descriptionComment(config.name, config.description),
    `export const ${camelName}IconNames = ${JSON.stringify(names, null, 2)}`,
    '',
    `export const ${camelName}IconIds = ${JSON.stringify(ids, null, 2)}`,
    '',
  ].join('\n')
}

function generateComponent(config: ResolvedSpriteConfig): string {
  const pascalName = toPascalCase(config.name)
  const camelName = toCamelCase(config.name)
  return [
    blockHeader(config.generatedNotice),
    "import { jsx } from 'react/jsx-runtime'",
    "import styles from './react-component.module.css'",
    `import { ${camelName}IconIds } from '../icon-data.js'`,
    "import spriteUrl from '../sprite.svg?no-inline'",
    '',
    `/** Иконка из SVG-спрайта «${config.name}». */`,
    `export const ${pascalName}Icon = (props) => {`,
    '  const { icon, wrapped, className, ...rest } = props',
    `  const href = spriteUrl + '#' + ${camelName}IconIds[icon]`,
    '',
    '  if (wrapped) {',
    "    return jsx('span', {",
    '      ...rest,',
    "      className: [styles.wrap, className].filter(Boolean).join(' '),",
    "      children: jsx('svg', { children: jsx('use', { href }) }),",
    '    })',
    '  }',
    '',
    "  return jsx('svg', {",
    '    ...rest,',
    "    className: [styles.root, className].filter(Boolean).join(' '),",
    "    children: jsx('use', { href }),",
    '  })',
    '}',
    '',
  ].join('\n')
}

function generateIconDeclarations(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const pascalName = toPascalCase(config.name)
  const camelName = toCamelCase(config.name)
  const tuple = artifact.icons.map((icon) => `  ${JSON.stringify(icon.name)},`).join('\n')
  const ids = artifact.icons.map((icon) => `  readonly ${JSON.stringify(icon.name)}: ${JSON.stringify(icon.id)}`).join('\n')
  return [
    blockHeader(config.generatedNotice),
    '',
    ...descriptionComment(config.name, config.description),
    `export declare const ${camelName}IconNames: readonly [`,
    tuple,
    ']',
    '',
    `export type ${pascalName}IconName = typeof ${camelName}IconNames[number]`,
    `export declare const ${camelName}IconIds: {`,
    ids,
    '}',
    '',
  ].join('\n')
}

function generateComponentDeclarations(config: ResolvedSpriteConfig): string {
  const pascalName = toPascalCase(config.name)
  return [
    blockHeader(config.generatedNotice),
    "import type { CSSProperties, HTMLAttributes, ReactElement, SVGAttributes } from 'react'",
    `import type { ${pascalName}IconName } from '../icon-data.js'`,
    '',
    `export type ${pascalName}IconStyle = CSSProperties & Partial<Record<\`--icon-color-\${number}\`, string | number>>`,
    '',
    `type ${pascalName}IconBaseProps = { icon: ${pascalName}IconName }`,
    `type ${pascalName}IconSvgProps = ${pascalName}IconBaseProps & { wrapped?: false } & Omit<SVGAttributes<SVGSVGElement>, 'style'> & { style?: ${pascalName}IconStyle }`,
    `type ${pascalName}IconWrappedProps = ${pascalName}IconBaseProps & { wrapped: true } & Omit<HTMLAttributes<HTMLSpanElement>, 'style'> & { style?: ${pascalName}IconStyle }`,
    `export type ${pascalName}IconProps = ${pascalName}IconSvgProps | ${pascalName}IconWrappedProps`,
    '',
    `export declare const ${pascalName}Icon: (props: ${pascalName}IconProps) => ReactElement`,
    '',
  ].join('\n')
}

function generateIndexDeclarations(config: ResolvedSpriteConfig): string {
  const pascalName = toPascalCase(config.name)
  const camelName = toCamelCase(config.name)
  return [
    blockHeader(config.generatedNotice),
    `export { ${pascalName}Icon } from './react/react-component.js'`,
    `export type { ${pascalName}IconProps, ${pascalName}IconStyle } from './react/react-component.js'`,
    `export { ${camelName}IconNames } from './icon-data.js'`,
    `export type { ${pascalName}IconName } from './icon-data.js'`,
    '',
  ].join('\n')
}

function generateIndex(config: ResolvedSpriteConfig): string {
  const pascalName = toPascalCase(config.name)
  const camelName = toCamelCase(config.name)
  return [
    blockHeader(config.generatedNotice),
    `export { ${pascalName}Icon } from './react/react-component.js'`,
    `export { ${camelName}IconNames } from './icon-data.js'`,
    '',
  ].join('\n')
}

function generateStyles(config: ResolvedSpriteConfig): string {
  const transition = config.transform.addTransition
    ? ['  transition-property: fill, stroke, color;', '  transition-duration: 0.3s;', '  transition-timing-function: ease;']
    : []
  return [
    blockHeader(config.generatedNotice),
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

function manifestData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact) {
  return {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    componentName: `${toPascalCase(config.name)}Icon`,
    mode: MODE,
    target: TARGET,
    format: artifact.format,
    iconCount: artifact.icons.length,
    spriteUrl: '__SPRITE_URL__',
    icons: artifact.icons,
  }
}

function generateManifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  const serialized = JSON.stringify(manifestData(config, artifact), null, 2)
    .replace('"__SPRITE_URL__"', 'spriteUrl')
  return [
    blockHeader(config.generatedNotice),
    "import spriteUrl from './sprite.svg?no-inline'",
    '',
    `export const spriteManifest = ${serialized}`,
    '',
    'export default spriteManifest',
    '',
  ].join('\n')
}

function generateManifestDeclarations(config: ResolvedSpriteConfig): string {
  return [
    blockHeader(config.generatedNotice),
    "import type { SpriteManifest } from '@gromlab/svg-sprites/react'",
    '',
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
    { path: path.posix.join(OUTPUT_DIR, 'index.js'), content: generateIndex(config) },
    { path: path.posix.join(OUTPUT_DIR, 'index.d.ts'), content: generateIndexDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: markedSvg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.js'), content: generateIconData(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'icon-data.d.ts'), content: generateIconDeclarations(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'react', 'react-component.js'), content: generateComponent(config) },
    { path: path.posix.join(OUTPUT_DIR, 'react', 'react-component.d.ts'), content: generateComponentDeclarations(config) },
    { path: path.posix.join(OUTPUT_DIR, 'react', 'react-component.module.css'), content: generateStyles(config) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.js'), content: generateManifest(config, artifact) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.d.ts'), content: generateManifestDeclarations(config) },
  ]
}
