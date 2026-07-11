import type { SvgSpritesConfig } from './types.js'
import type { NextSpriteConfig } from './modes/next/types.js'
import type { ReactSpriteConfig } from './modes/react/types.js'

export { generateLegacy } from './modes/legacy/generate.js'
export { resolveSprites, resolveSpriteEntry } from './scanner.js'
export { compileSprite, compileSpriteContent } from './compiler.js'
export type { CompileSpriteOptions } from './compiler.js'
export { createShapeTransform } from './transforms.js'
export { generatePreview } from './preview.js'
export { loadLegacyConfig } from './modes/legacy/config.js'
export { generateNextSprite } from './modes/next/index.js'
export {
  generateReactSprite,
  loadReactSpriteConfig,
} from './modes/react/index.js'
export type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
  ReactAssetTarget,
  SpriteAssetTarget,
  ViteAssetTarget,
  WebpackAssetTarget,
} from './targets/types.js'

export type {
  SvgSpritesConfig,
  SpriteEntry,
  SpriteResult,
  SpriteFolder,
  SpriteFormat,
  TransformOptions,
} from './types.js'
export type {
  NextSpriteConfig,
  NextSpriteGenerationOptions,
  NextSpriteGenerationResult,
} from './modes/next/types.js'
export type {
  ReactSpriteConfig,
  ReactSpriteGenerationResult,
  ResolvedReactSpriteConfig,
} from './modes/react/types.js'

/** Хелпер для типизации legacy-конфига. */
export function defineLegacyConfig(config: SvgSpritesConfig): SvgSpritesConfig {
  return config
}

/** Хелпер для типизации локального React-конфига. */
export function defineReactSpriteConfig(config: ReactSpriteConfig): ReactSpriteConfig {
  return config
}

/** Хелпер для типизации локального Next.js-конфига. */
export function defineNextSpriteConfig(config: NextSpriteConfig): NextSpriteConfig {
  return config
}
