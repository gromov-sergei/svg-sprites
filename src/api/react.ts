import { generateSprite } from '../generate.js'
import type { ReactAssetTarget, ReactSpriteMode } from '../targets/types.js'
import type { ResolvedSpriteConfig, SpriteConfig } from '../types.js'
import type { SpriteGenerationBaseResult } from '../core/result.js'

/** @deprecated Используйте единый SpriteConfig. */
export type ReactSpriteConfig = Omit<SpriteConfig, 'mode'> & {
  mode?: ReactSpriteMode
}

/** @deprecated Используйте единый ResolvedSpriteConfig. */
export type ResolvedReactSpriteConfig = Omit<ResolvedSpriteConfig, 'mode'> & {
  mode: ReactSpriteMode
}

export type ReactSpriteGenerationResult = SpriteGenerationBaseResult<
  ReactSpriteMode,
  ReactAssetTarget
>

/** Генерирует React sprite-модуль для явно выбранного asset target. */
export function generateReactSprite(
  source: string,
  target: ReactAssetTarget,
): Promise<ReactSpriteGenerationResult> {
  if (target !== 'vite' && target !== 'webpack') {
    throw new Error(`Unsupported React asset target: ${String(target)}`)
  }
  return generateSprite(source, { mode: `react@${target}` }) as Promise<ReactSpriteGenerationResult>
}
