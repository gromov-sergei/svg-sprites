import type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
  ReactAssetTarget,
  SpriteMode,
} from '../targets/types.js'
import type { ResolvedSpriteConfig, SpriteFolder } from '../types.js'

export type GeneratedFile = {
  readonly path: string
  readonly content: string | Uint8Array
}

export type PreparedSprite = {
  readonly folder: SpriteFolder
  readonly iconNames: readonly string[]
}

export type ModeAdapterContext = {
  readonly rootDir: string
  readonly config: ResolvedSpriteConfig
  readonly prepared: PreparedSprite
}

export type ReactModeResultMetadata = {
  readonly target: ReactAssetTarget
}

export type NextModeResultMetadata = {
  readonly target: NextAssetTarget
  readonly router: NextRouter
  readonly bundler: NextBundler
}

export type ModeResultMetadata = ReactModeResultMetadata | NextModeResultMetadata

export type OutputPlan = {
  readonly files: readonly GeneratedFile[]
  readonly paths: {
    readonly generatedDir: '.svg-sprite'
    readonly sprite: string
    readonly manifest: string
    readonly entry: string
  }
  readonly result: ModeResultMetadata
}

export interface ModeAdapter<M extends SpriteMode = SpriteMode> {
  readonly mode: M
  readonly contractVersion: number
  generate(context: ModeAdapterContext): Promise<OutputPlan>
}
