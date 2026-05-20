import fs from 'node:fs'
import path from 'node:path'
import type { SpriteFolder, SpriteResult } from './types.js'

/** Преобразует kebab-case строку в PascalCase. */
function toPascalCase(str: string): string {
  return str.replace(/(^|[-_])([a-z])/g, (_, __, c: string) => c.toUpperCase())
}

/**
 * Собирает имена иконок из SpriteFolder.
 */
function getIconNames(folder: SpriteFolder): string[] {
  return folder.files
    .map((filePath) => path.basename(filePath, '.svg'))
    .sort()
}

/**
 * Генерирует index.ts, [name].tsx и [name].module.css — React-компонент с типами.
 *
 * Имена файлов берутся из basename папки outputDir.
 * Например: outputDir = 'src/ui/svg-sprite' → index.ts + svg-sprite.tsx + svg-sprite.module.css.
 *
 * Содержит:
 * - union-типы имён иконок для каждого спрайта (IconsIconName, LogosIconName, ...)
 * - SpriteMap, SpriteName, IconName
 * - компонент SvgSprite с зашитым publicPath
 */
export function generateReactModule(
  results: SpriteResult[],
  folders: SpriteFolder[],
  outputDir: string,
  publicPath: string,
): string {
  const typeBlocks: string[] = []
  const mapEntries: string[] = []
  const spriteFileEntries: string[] = []

  for (const result of results) {
    const folder = folders.find((f) => f.name === result.name)
    if (!folder) continue

    const typeName = `${toPascalCase(result.name)}IconName`
    const names = getIconNames(folder)

    typeBlocks.push(
      `/** Имена иконок спрайта «${result.name}». */`,
      `export type ${typeName} =`,
      names.map((n) => `  | '${n}'`).join('\n'),
      '',
    )

    mapEntries.push(`  ${result.name}: ${typeName}`)
    spriteFileEntries.push(`  ${result.name}: '${result.name}.sprite.svg',`)
  }

  const baseName = path.basename(outputDir)
  const defaultSprite = results[0].name

  const lines = [
    '/**',
    ' * SVG-спрайты: типы и React-компонент.',
    ' * @generated — this file is auto-generated, do not edit manually.',
    ' */',
    "import type { SVGAttributes, HTMLAttributes } from 'react'",
    `import styles from './${baseName}.module.css'`,
    '',
    ...typeBlocks,
    '/** Маппинг имени спрайта на тип его иконок. */',
    'export type SpriteMap = {',
    ...mapEntries,
    '}',
    '',
    '/** Имя спрайта. */',
    'export type SpriteName = keyof SpriteMap',
    '',
    '/** Спрайт по умолчанию. */',
    `export type DefaultSprite = '${defaultSprite}'`,
    '',
    '/** Имя иконки для конкретного спрайта. */',
    'export type IconName<S extends SpriteName = SpriteName> = SpriteMap[S]',
    '',
    `const PUBLIC_PATH = '${publicPath}'`,
    `const DEFAULT_SPRITE: SpriteName = '${defaultSprite}'`,
    '',
    'const SPRITE_FILES: Record<SpriteName, string> = {',
    ...spriteFileEntries,
    '}',
    '',
    'type IconBaseProps<S extends SpriteName> = {',
    '  /** Имя иконки. */',
    '  icon: IconName<S>',
    '  /** Имя спрайта. По умолчанию: первый из конфига. */',
    '  sprite?: S',
    '}',
    '',
    'type IconSvgProps<S extends SpriteName> = IconBaseProps<S> & {',
    '  wrapped?: false',
    '} & SVGAttributes<SVGSVGElement>',
    '',
    'type IconWrappedProps<S extends SpriteName> = IconBaseProps<S> & {',
    '  wrapped: true',
    '} & HTMLAttributes<HTMLSpanElement>',
    '',
    'export type SvgSpriteProps<S extends SpriteName = DefaultSprite> =',
    '  | IconSvgProps<S>',
    '  | IconWrappedProps<S>',
    '',
    '/**',
    ' * Иконка из SVG-спрайта.',
    ' *',
    ' * Используется для:',
    ' *  - отображения иконки через `<use href="...">`',
    ' *  - обёртки в `<span>` через проп `wrapped`',
    ' *',
    ` * Спрайт по умолчанию: «${defaultSprite}».`,
    ' */',
    'export const SvgSprite = <S extends SpriteName = DefaultSprite>(props: SvgSpriteProps<S>) => {',
    '  const { icon, sprite = DEFAULT_SPRITE as S, wrapped, className, ...rest } = props',
    // eslint-disable-next-line no-template-curly-in-string
    '  const href = `${PUBLIC_PATH}/${SPRITE_FILES[sprite]}#${icon}`',
    '',
    '  if (wrapped) {',
    '    const { ...htmlAttr } = rest as HTMLAttributes<HTMLSpanElement>',
    '    return (',
    '      <span {...htmlAttr} className={[styles.wrap, className].filter(Boolean).join(\' \')}>',
    '        <svg>',
    '          <use href={href} />',
    '        </svg>',
    '      </span>',
    '    )',
    '  }',
    '',
    '  const { ...svgAttr } = rest as SVGAttributes<SVGSVGElement>',
    '  return (',
    '    <svg {...svgAttr} className={[styles.root, className].filter(Boolean).join(\' \')}>',
    '      <use href={href} />',
    '    </svg>',
    '  )',
    '}',
    '',
  ]

  const content = lines.join('\n')
  const outputPath = path.join(outputDir, `${baseName}.tsx`)

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, content)

  // Генерируем CSS Module
  const css = [
    '/* @generated — this file is auto-generated, do not edit manually. */',
    '',
    '.root {',
    '  transition-property: fill, stroke, color;',
    '  transition-duration: 0.3s;',
    '  transition-timing-function: ease;',
    '}',
    '',
    '.wrap {',
    '  display: inline-flex;',
    '}',
    '',
    '.wrap svg {',
    '  width: 100%;',
    '  height: 100%;',
    '  transition-property: fill, stroke, color;',
    '  transition-duration: 0.3s;',
    '  transition-timing-function: ease;',
    '}',
    '',
  ].join('\n')

  const cssPath = path.join(outputDir, `${baseName}.module.css`)
  fs.writeFileSync(cssPath, css)

  const index = [
    '/** @generated — this file is auto-generated, do not edit manually. */',
    `export { SvgSprite } from './${baseName}'`,
    'export type {',
    '  SvgSpriteProps,',
    '  SpriteName,',
    '  SpriteMap,',
    '  IconName,',
    '  DefaultSprite,',
    `} from './${baseName}'`,
    '',
  ].join('\n')

  const indexPath = path.join(outputDir, 'index.ts')
  fs.writeFileSync(indexPath, index)

  return outputPath
}
