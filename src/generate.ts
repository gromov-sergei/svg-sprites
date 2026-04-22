import path from 'node:path'
import { resolveSprites } from './scanner.js'
import { compileSprite } from './compiler.js'
import { generateReactModule } from './codegen-react.js'
import { generatePreview } from './preview.js'
import { log } from './logger.js'
import type { SvgSpritesConfig, SpriteResult } from './types.js'

/**
 * Генерирует SVG-спрайты из конфига.
 *
 * Основная точка входа — используется и из CLI, и из программного API.
 */
export async function generate(config: SvgSpritesConfig): Promise<SpriteResult[]> {
  const {
    output,
    publicPath,
    preview = true,
    react,
    transform = {},
    sprites,
  } = config

  const outputDir = path.resolve(output)

  log.title('Resolving sprites...')

  const folders = resolveSprites(sprites)

  if (folders.length === 0) {
    log.warn('No sprites to generate.')
    return []
  }

  log.info(`Found ${folders.length} sprite(s)\n`)

  const results: SpriteResult[] = []

  for (const folder of folders) {
    const spritePath = await compileSprite(folder, outputDir, transform)
    log.success(`  [${folder.mode}] ${folder.name} → ${path.relative(process.cwd(), spritePath)} (${folder.files.length} icons)`)

    results.push({
      name: folder.name,
      mode: folder.mode,
      spritePath,
      iconCount: folder.files.length,
    })
  }

  if (react) {
    const reactDir = path.resolve(react)
    const resolvedPublicPath = publicPath ?? `/${output}`
    const iconPath = generateReactModule(results, folders, reactDir, resolvedPublicPath)
    log.success(`  [react]  → ${path.relative(process.cwd(), iconPath)}`)
  }

  if (preview) {
    const previewPath = generatePreview(results, outputDir)
    log.success(`\n  [preview] → ${path.relative(process.cwd(), previewPath)}`)
  }

  console.log('')
  log.success(`Done! Generated ${results.length} sprite(s).`)

  return results
}
