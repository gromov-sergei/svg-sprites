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
export { compileSprite, compileSpriteContent, compileSpriteSourceContent } from './compiler.js'
export type { CompileSpriteOptions, SpriteSourceContent } from './compiler.js'
export { createShapeTransform } from './transforms.js'

export type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
  AlpineSpriteMode,
  AngularAssetTarget,
  AngularSpriteMode,
  AstroSpriteMode,
  LitSpriteMode,
  NuxtSpriteMode,
  PreactSpriteMode,
  QwikSpriteMode,
  ReactAssetTarget,
  ReactSpriteMode,
  SolidSpriteMode,
  StandaloneAssetTarget,
  StandaloneSpriteMode,
  ServerAssetTarget,
  ServerSpriteMode,
  StaticAssetTarget,
  SvelteSpriteMode,
  SpriteAssetTarget,
  SpriteMode,
  ViteAssetTarget,
  VueSpriteMode,
  WebpackAssetTarget,
} from './targets/types.js'
export type {
  StandaloneSpriteManifest,
  StandaloneSpriteManifestColor,
  StandaloneSpriteManifestData,
  StandaloneSpriteManifestIcon,
  StandaloneTargetForMode,
} from './manifest-types.js'
export type {
  ResolvedSpriteConfig,
  SpriteConfig,
  SpriteFolder,
  SpriteFormat,
  SpriteSource,
  ServerSvgInput,
  TransformOptions,
} from './types.js'
export type {
  ServerSpriteAsset,
  ServerSpriteManifest,
  SpriteCompileProfile,
} from './release/types.js'
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
