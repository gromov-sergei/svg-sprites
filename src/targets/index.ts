import { generateViteAssetUrlCode } from './vite.js'
import { generateWebpackAssetUrlCode } from './webpack.js'
import type { SpriteAssetTarget, SpriteAssetUrlCode } from './types.js'

/** Возвращает codegen-фрагменты для выбранной среды сборки React-модуля. */
export function generateReactAssetUrlCode(
  target: SpriteAssetTarget,
  spriteFileName: string,
): SpriteAssetUrlCode {
  switch (target) {
    case 'vite':
      return generateViteAssetUrlCode(spriteFileName)
    case 'webpack':
    case 'next@app/turbopack':
    case 'next@app/webpack':
    case 'next@pages/turbopack':
    case 'next@pages/webpack':
      return generateWebpackAssetUrlCode(spriteFileName)
    default:
      throw new Error(`Unsupported sprite asset target: ${String(target)}`)
  }
}

export type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
  ReactAssetTarget,
  SpriteAssetTarget,
  SpriteAssetUrlCode,
  ViteAssetTarget,
  WebpackAssetTarget,
} from './types.js'
