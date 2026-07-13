import type { NextSpriteConfig } from './api/next.js'
import type { ReactSpriteConfig } from './api/react.js'
import type { SpriteConfig } from './types.js'

export {
  isSpriteMode,
  loadSpriteConfig,
  resolveSpriteConfig,
  resolveSpriteConfigSource,
  validateSpriteConfig,
} from './config.js'
export { generateSprite } from './generate.js'
export type { SpriteGenerationResult } from './generate.js'
export { generateNextSprite } from './api/next.js'
export { generateReactSprite } from './api/react.js'
export { compileSprite, compileSpriteContent } from './compiler.js'
export type { CompileSpriteOptions } from './compiler.js'
export { createShapeTransform } from './transforms.js'

export type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
  ReactAssetTarget,
  ReactSpriteMode,
  SpriteAssetTarget,
  SpriteMode,
  ViteAssetTarget,
  WebpackAssetTarget,
} from './targets/types.js'
export type {
  ResolvedSpriteConfig,
  SpriteConfig,
  SpriteFolder,
  SpriteFormat,
  TransformOptions,
} from './types.js'
export type {
  NextSpriteConfig,
  NextSpriteGenerationOptions,
  NextSpriteGenerationResult,
} from './api/next.js'
export type {
  ReactSpriteConfig,
  ReactSpriteGenerationResult,
  ResolvedReactSpriteConfig,
} from './api/react.js'

/** Хелпер для типизации единого sprite-конфига. */
export function defineSpriteConfig(config: SpriteConfig): SpriteConfig {
  return config
}

/** @deprecated Используйте defineSpriteConfig. */
export function defineReactSpriteConfig(config: ReactSpriteConfig): ReactSpriteConfig {
  return config
}

/** @deprecated Используйте defineSpriteConfig. */
export function defineNextSpriteConfig(config: NextSpriteConfig): NextSpriteConfig {
  return config
}
