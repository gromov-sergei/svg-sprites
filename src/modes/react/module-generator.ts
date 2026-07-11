import path from 'node:path'
import { compileSpriteContent } from '../../compiler.js'
import { log } from '../../logger.js'
import { resolveSpriteSources } from '../../scanner.js'
import { getSpriteShapeId } from '../../shape-id.js'
import type { SpriteAssetTarget } from '../../targets/types.js'
import { generateReactFiles } from './codegen.js'
import { loadReactSpriteConfig } from './config.js'
import type { SpriteModuleGenerationResult } from './types.js'
import { writeReactFiles } from './writer.js'

type GenerateSpriteModuleOptions = {
  mode: string
  rootViewBox: boolean
}

function validateIconIds(iconNames: string[]): void {
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

/** Общая генерация типизированного React-компонента для React и Next.js modes. */
export async function generateSpriteModule<TTarget extends SpriteAssetTarget>(
  root: string,
  target: TTarget,
  options: GenerateSpriteModuleOptions,
): Promise<SpriteModuleGenerationResult<TTarget>> {
  const rootDir = path.resolve(root)
  const config = await loadReactSpriteConfig(rootDir)
  const format = 'stack'
  const folder = resolveSpriteSources({
    name: config.name,
    format,
    inputFolder: config.inputFolder,
    inputFiles: config.inputFiles,
  })

  const iconNames = folder.files
    .map((filePath) => path.basename(filePath, '.svg'))
    .sort()
  validateIconIds(iconNames)

  const sprite = await compileSpriteContent(folder, config.transform, {
    rootViewBox: options.rootViewBox,
  })
  const files = generateReactFiles({ config, format, iconNames, sprite, target })

  writeReactFiles(rootDir, files, config.generatedNotice)

  const generatedDir = path.join(rootDir, 'generated')
  const spritePath = path.join(generatedDir, 'sprite.svg')
  const manifestPath = path.join(rootDir, 'manifest.ts')
  const iconLabel = iconNames.length === 1 ? 'icon' : 'icons'
  log.success(`✓ ${config.name} · ${iconNames.length} ${iconLabel} · ${options.mode}`)
  log.detail(`  → ${path.relative(process.cwd(), generatedDir)}`)

  return {
    name: config.name,
    rootDir,
    generatedDir,
    spritePath,
    manifestPath,
    iconCount: iconNames.length,
    target,
  }
}
