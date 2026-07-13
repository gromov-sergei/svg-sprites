import path from 'node:path'
import {
  resolveSpriteConfig,
  resolveSpriteConfigSource,
} from './config.js'
import type { ModeResultMetadata } from './core/mode-adapter.js'
import { writeOutputPlan } from './core/output-writer.js'
import { prepareSprite } from './core/prepare-sprite.js'
import type { SpriteGenerationBaseResult } from './core/result.js'
import { log } from './logger.js'
import { getModeAdapter } from './mode-registry.js'
import type { SpriteConfig } from './types.js'

export type SpriteGenerationResult = SpriteGenerationBaseResult & ModeResultMetadata

/** Генерирует один output через adapter разрешённого exact mode. */
export async function generateSprite(
  source: string,
  overrides: SpriteConfig = {},
): Promise<SpriteGenerationResult> {
  const resolvedSource = await resolveSpriteConfigSource(source)
  const config = resolveSpriteConfig(
    resolvedSource.rootDir,
    resolvedSource.config,
    overrides,
  )
  const adapter = getModeAdapter(config.mode)
  const prepared = prepareSprite(config)
  const plan = await adapter.generate({
    rootDir: resolvedSource.rootDir,
    config,
    prepared,
  })
  const plannedPaths = new Set(plan.files.map((file) => file.path.replaceAll('\\', '/')))

  for (const requiredPath of [plan.paths.entry, plan.paths.sprite, plan.paths.manifest]) {
    if (!plannedPaths.has(requiredPath)) {
      throw new Error(`Mode "${config.mode}" result path is missing from its output plan: ${requiredPath}`)
    }
  }

  writeOutputPlan(
    resolvedSource.rootDir,
    adapter.mode,
    adapter.contractVersion,
    plan.files,
    config.generatedNotice,
  )

  const generatedDir = path.resolve(resolvedSource.rootDir, plan.paths.generatedDir)
  const iconLabel = prepared.iconNames.length === 1 ? 'icon' : 'icons'
  log.success(`✓ ${config.name} · ${prepared.iconNames.length} ${iconLabel} · ${config.mode}`)
  log.detail(`  → ${path.relative(process.cwd(), generatedDir)}`)

  return {
    name: config.name,
    rootDir: resolvedSource.rootDir,
    generatedDir,
    spritePath: path.resolve(resolvedSource.rootDir, plan.paths.sprite),
    manifestPath: path.resolve(resolvedSource.rootDir, plan.paths.manifest),
    iconCount: prepared.iconNames.length,
    mode: config.mode,
    ...plan.result,
  }
}
