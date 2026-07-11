import path from 'node:path'
import { compileSprite } from '../../compiler.js'
import { log } from '../../logger.js'
import { generatePreview } from '../../preview.js'
import { resolveSprites } from '../../scanner.js'
import type { SpriteResult, SvgSpritesConfig } from '../../types.js'

/** Генерирует SVG-спрайты через legacy pipeline. */
export async function generateLegacy(config: SvgSpritesConfig): Promise<SpriteResult[]> {
  const {
    output,
    preview = true,
    transform = {},
    sprites,
  } = config
  const outputDir = path.resolve(output)

  log.title('Resolving legacy sprites...')

  const folders = resolveSprites(sprites)

  if (folders.length === 0) {
    log.warn('No sprites to generate.')
    return []
  }

  log.info(`Found ${folders.length} sprite(s)\n`)

  const results: SpriteResult[] = []

  for (const folder of folders) {
    const spritePath = await compileSprite(folder, outputDir, transform)
    log.success(`  [${folder.format}] ${folder.name} → ${path.relative(process.cwd(), spritePath)} (${folder.files.length} icons)`)

    results.push({
      name: folder.name,
      format: folder.format,
      spritePath,
      iconCount: folder.files.length,
    })
  }

  if (preview) {
    const previewPath = generatePreview(results, outputDir)
    log.success(`\n  [preview] → ${path.relative(process.cwd(), previewPath)}`)
  }

  console.log('')
  log.success(`Done! Generated ${results.length} sprite(s).`)

  return results
}
