import type { SvgSpritesConfig } from './types.js'

export { generate } from './generate.js'
export { resolveSprites, resolveSpriteEntry } from './scanner.js'
export { compileSprite } from './compiler.js'
export { createShapeTransform } from './transforms.js'
export { generatePreview } from './preview.js'
export { generateReactModule } from './codegen-react.js'
export { loadConfig } from './config.js'

export type {
  SvgSpritesConfig,
  SpriteEntry,
  SpriteResult,
  SpriteFolder,
  SpriteMode,
  TransformOptions,
} from './types.js'

/**
 * Хелпер для типизации конфига с автодополнением.
 */
export function defineConfig(config: SvgSpritesConfig): SvgSpritesConfig {
  return config
}
