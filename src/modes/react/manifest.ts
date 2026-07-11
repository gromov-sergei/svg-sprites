import { getSpriteShapeId } from '../../shape-id.js'
import { generateReactAssetUrlCode } from '../../targets/index.js'
import type { SpriteAssetTarget } from '../../targets/types.js'
import type { SpriteFormat } from '../../types.js'
import { toPascalCase } from './naming.js'

type ManifestIconColor = {
  variable: string
  fallback: string
}

type ManifestIcon = {
  name: string
  id: string
  viewBox: string | null
  colors: ManifestIconColor[]
}

type GenerateManifestOptions = {
  header: string
  name: string
  description?: string
  format: SpriteFormat
  iconNames: string[]
  sprite: Uint8Array
  target: SpriteAssetTarget
}

function extractColors(fragment: string): ManifestIconColor[] {
  const colors = new Map<string, string>()
  const regex = /var\((--icon-color-\d+),\s*((?:[^()]|\([^()]*\))*)\)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(fragment)) !== null) {
    if (!colors.has(match[1])) colors.set(match[1], match[2].trim())
  }

  return [...colors].map(([variable, fallback]) => ({ variable, fallback }))
}

function extractManifestIcons(sprite: Uint8Array, iconNames: string[]): ManifestIcon[] {
  const shapes = new Map<string, { viewBox: string | null; fragment: string }>()
  const content = new TextDecoder().decode(sprite)
  const shapeRegex = /<(symbol|svg)\b((?=[^>]*\bid="[^"]+")[^>]*)>[\s\S]*?<\/\1>/g
  let match: RegExpExecArray | null

  while ((match = shapeRegex.exec(content)) !== null) {
    const attributes = match[2]
    const id = attributes.match(/\bid="([^"]+)"/)?.[1]
    if (!id) continue

    shapes.set(id, {
      viewBox: attributes.match(/\bviewBox="([^"]+)"/)?.[1] ?? null,
      fragment: match[0],
    })
  }

  return iconNames.map((name) => {
    const id = getSpriteShapeId(name)
    const shape = shapes.get(id)
    if (!shape) throw new Error(`Cannot find SVG shape "${id}" for icon "${name}".`)

    return {
      name,
      id,
      viewBox: shape.viewBox,
      colors: extractColors(shape.fragment),
    }
  })
}

function generateIcon(icon: ManifestIcon): string[] {
  return [
    '    {',
    `      name: ${JSON.stringify(icon.name)},`,
    `      id: ${JSON.stringify(icon.id)},`,
    `      viewBox: ${JSON.stringify(icon.viewBox)},`,
    '      colors: [',
    ...icon.colors.flatMap((color) => [
      '        {',
      `          variable: ${JSON.stringify(color.variable)},`,
      `          fallback: ${JSON.stringify(color.fallback)},`,
      '        },',
    ]),
    '      ],',
    '    },',
  ]
}

/** Генерирует отдельную debug-точку входа с метаданными спрайта. */
export function generateSpriteManifest(options: GenerateManifestOptions): string {
  const { header, name, description, format, iconNames, sprite, target } = options
  const assetUrlCode = generateReactAssetUrlCode(target, 'generated/sprite.svg')
  const icons = extractManifestIcons(sprite, iconNames)

  return [
    header,
    ...assetUrlCode.imports,
    ...(assetUrlCode.imports.length > 0 ? [''] : []),
    ...assetUrlCode.declarations,
    ...(assetUrlCode.declarations.length > 0 ? [''] : []),
    'export const spriteManifest = {',
    '  schemaVersion: 1,',
    "  generator: '@gromlab/svg-sprites',",
    `  name: ${JSON.stringify(name)},`,
    ...(description === undefined ? [] : [`  description: ${JSON.stringify(description)},`]),
    `  componentName: ${JSON.stringify(`${toPascalCase(name)}Icon`)},`,
    `  target: ${JSON.stringify(target)},`,
    `  format: ${JSON.stringify(format)},`,
    `  iconCount: ${icons.length},`,
    `  spriteUrl: ${assetUrlCode.variableName},`,
    '  icons: [',
    ...icons.flatMap(generateIcon),
    '  ],',
    '} as const',
    '',
    'export default spriteManifest',
    '',
  ].join('\n')
}
