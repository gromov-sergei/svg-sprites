import type { NextAssetTarget } from '../../targets/types.js'
import { generateSpriteModule } from '../react/module-generator.js'
import type {
  NextSpriteGenerationOptions,
  NextSpriteGenerationResult,
} from './types.js'

/** Генерирует Next.js sprite-модуль для явно выбранных роутера и сборщика. */
export async function generateNextSprite(
  root: string,
  options: NextSpriteGenerationOptions,
): Promise<NextSpriteGenerationResult> {
  if (!options || (options.router !== 'app' && options.router !== 'pages')) {
    throw new Error(`Unsupported Next.js router: ${String(options?.router)}`)
  }
  if (options.bundler !== 'turbopack' && options.bundler !== 'webpack') {
    throw new Error(`Unsupported Next.js bundler: ${String(options.bundler)}`)
  }

  const { router, bundler } = options
  const target: NextAssetTarget = `next@${router}/${bundler}`
  const result = await generateSpriteModule(root, target, {
    mode: target,
    rootViewBox: true,
  })

  return {
    ...result,
    router,
    bundler,
  }
}
