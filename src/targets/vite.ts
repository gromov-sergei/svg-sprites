import type { SpriteAssetUrlCode } from './types.js'

/** Генерирует Vite-импорт отдельного, запрещённого к inline SVG asset. */
export function generateViteAssetUrlCode(spriteFileName: string): SpriteAssetUrlCode {
  return {
    imports: [`import spriteUrl from './${spriteFileName}?no-inline'`],
    declarations: [],
    variableName: 'spriteUrl',
  }
}
