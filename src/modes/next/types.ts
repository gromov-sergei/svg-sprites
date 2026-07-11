import type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
} from '../../targets/types.js'
import type {
  ReactSpriteConfig,
  SpriteModuleGenerationResult,
} from '../react/types.js'

/** Конфигурация Next.js sprite-модуля. Совпадает с React-конфигурацией. */
export type NextSpriteConfig = ReactSpriteConfig

export type NextSpriteGenerationOptions = {
  router: NextRouter
  bundler: NextBundler
}

export type NextSpriteGenerationResult = SpriteModuleGenerationResult<NextAssetTarget> & {
  router: NextRouter
  bundler: NextBundler
}
