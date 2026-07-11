import type { ReactAssetTarget } from '../../targets/types.js'
import { generateSpriteModule } from './module-generator.js'
import type { ReactSpriteGenerationResult } from './types.js'

/** Генерирует один локальный React sprite-модуль для Vite или Webpack. */
export function generateReactSprite(
  root: string,
  target: ReactAssetTarget,
): Promise<ReactSpriteGenerationResult> {
  if (target !== 'vite' && target !== 'webpack') {
    throw new Error(`Unsupported React asset target: ${String(target)}`)
  }

  return generateSpriteModule(root, target, {
    mode: `react@${target}`,
    rootViewBox: false,
  })
}
