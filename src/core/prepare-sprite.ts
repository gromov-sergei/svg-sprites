import path from 'node:path'
import { resolveSpriteSources } from '../scanner.js'
import { getSpriteShapeId } from '../shape-id.js'
import type { ResolvedSpriteConfig } from '../types.js'
import type { PreparedSprite } from './mode-adapter.js'

export function validateIconIds(iconNames: readonly string[]): void {
  const namesById = new Map<string, string>()

  for (const iconName of iconNames) {
    const id = getSpriteShapeId(iconName)
    const existingName = namesById.get(id)

    if (existingName) {
      throw new Error(
        `Icons "${existingName}" and "${iconName}" produce the same SVG id "${id}". Rename one of the files.`,
      )
    }

    namesById.set(id, iconName)
  }
}

/** Подготавливает mode-neutral набор исходников. */
export function prepareSprite(config: ResolvedSpriteConfig): PreparedSprite {
  if (config.source !== 'local') {
    throw new Error('Local sprite preparation requires source "local".')
  }
  if (config.input.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Mode "${config.mode}" only accepts local path or glob inputs.`)
  }
  const folder = resolveSpriteSources({
    name: config.name,
    format: 'stack',
    input: config.input as string[],
  })
  const iconNames = folder.files
    .map((filePath) => path.basename(filePath, '.svg'))
    .sort()

  validateIconIds(iconNames)
  return { kind: 'local', folder, iconNames }
}
