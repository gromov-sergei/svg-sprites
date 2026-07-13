import type { SpriteGenerationBaseResult } from '../core/result.js'
import { generateSprite } from '../generate.js'
import type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
} from '../targets/types.js'
import type { SpriteConfig } from '../types.js'

/** @deprecated Используйте единый SpriteConfig. */
export type NextSpriteConfig = Omit<SpriteConfig, 'mode'> & {
  mode?: NextAssetTarget
}

export type NextSpriteGenerationOptions = {
  router: NextRouter
  bundler: NextBundler
}

export type NextSpriteGenerationResult = SpriteGenerationBaseResult<
  NextAssetTarget,
  NextAssetTarget
> & {
  router: NextRouter
  bundler: NextBundler
}

/** Генерирует Next.js sprite-модуль для явно выбранных router и bundler. */
export async function generateNextSprite(
  source: string,
  options: NextSpriteGenerationOptions,
): Promise<NextSpriteGenerationResult> {
  if (!options || (options.router !== 'app' && options.router !== 'pages')) {
    throw new Error(`Unsupported Next.js router: ${String(options?.router)}`)
  }
  if (options.bundler !== 'turbopack' && options.bundler !== 'webpack') {
    throw new Error(`Unsupported Next.js bundler: ${String(options.bundler)}`)
  }

  return generateSprite(source, {
    mode: `next@${options.router}/${options.bundler}`,
  }) as Promise<NextSpriteGenerationResult>
}
