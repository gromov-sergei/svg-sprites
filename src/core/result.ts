import type { SpriteAssetTarget, SpriteMode } from '../targets/types.js'

export type SpriteGenerationBaseResult<
  TMode extends SpriteMode = SpriteMode,
  TTarget extends SpriteAssetTarget = SpriteAssetTarget,
> = {
  name: string
  rootDir: string
  generatedDir: string
  spritePath: string
  manifestPath: string
  iconCount: number
  mode: TMode
  target: TTarget
}
