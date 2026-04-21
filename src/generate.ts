import path from 'node:path'
import { scanSpriteFolders } from './scanner.js'
import { compileSprite } from './compiler.js'
import { generateIconTypes } from './codegen.js'
import { generatePreview } from './preview.js'
import { log } from './logger.js'
import type { GenerateOptions, SpriteResult } from './types.js'

/**
 * Генерирует SVG-спрайты и (опционально) TypeScript-типы для всех подпапок.
 *
 * Основная точка входа — используется и из CLI, и из программного API.
 */
export async function generate(options: GenerateOptions): Promise<SpriteResult[]> {
  const {
    input,
    output,
    types = true,
    typesOutput,
    transform = {},
    preview = true,
  } = options

  const inputDir = path.resolve(input)
  const outputDir = path.resolve(output)
  const typesDir = typesOutput ? path.resolve(typesOutput) : inputDir

  log.title(`Scanning ${inputDir}...`)

  const folders = scanSpriteFolders(inputDir)

  if (folders.length === 0) {
    log.warn('No sprite folders with SVG files found.')
    return []
  }

  log.info(`Found ${folders.length} sprite folder(s)\n`)

  const results: SpriteResult[] = []

  for (const folder of folders) {
    const spritePath = await compileSprite(folder, outputDir, transform)
    log.success(`  [${folder.mode}] ${folder.name} → ${path.relative(process.cwd(), spritePath)} (${folder.files.length} icons)`)

    let typesPath: string | null = null
    if (types) {
      typesPath = generateIconTypes(folder, typesDir)
      log.success(`  [types] ${folder.name} → ${path.relative(process.cwd(), typesPath)}`)
    }

    results.push({
      name: folder.name,
      mode: folder.mode,
      spritePath,
      typesPath,
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
