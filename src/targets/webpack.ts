import type { SpriteAssetUrlCode } from './types.js'

/** Генерирует Webpack 5 Asset Module через статический import.meta.url. */
export function generateWebpackAssetUrlCode(spriteFileName: string): SpriteAssetUrlCode {
  return {
    imports: [],
    declarations: [
      `const spriteUrl = new URL('./${spriteFileName}', import.meta.url).href`,
    ],
    variableName: 'spriteUrl',
  }
}
