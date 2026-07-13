import { getSpriteShapeId } from '../shape-id.js'
import type { SpriteFormat } from '../types.js'

export type CompiledIconColor = {
  readonly variable: string
  readonly fallback: string
}

export type CompiledIcon = {
  readonly name: string
  readonly id: string
  readonly viewBox: string | null
  readonly colors: readonly CompiledIconColor[]
}

export type CompiledSpriteArtifact = {
  readonly format: SpriteFormat
  readonly bytes: Uint8Array
  readonly icons: readonly CompiledIcon[]
}

function extractColors(fragment: string): CompiledIconColor[] {
  const colors = new Map<string, string>()
  const regex = /var\((--icon-color-\d+),\s*((?:[^()]|\([^()]*\))*)\)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(fragment)) !== null) {
    if (!colors.has(match[1])) colors.set(match[1], match[2].trim())
  }

  return [...colors].map(([variable, fallback]) => ({ variable, fallback }))
}

/** Преобразует compiled SVG в нейтральный artifact для adapter codegen. */
export function createCompiledSpriteArtifact(
  bytes: Uint8Array,
  iconNames: readonly string[],
  format: SpriteFormat,
): CompiledSpriteArtifact {
  const shapes = new Map<string, { viewBox: string | null; fragment: string }>()
  const content = new TextDecoder().decode(bytes)
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

  const icons = iconNames.map((name) => {
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

  return { format, bytes, icons }
}
