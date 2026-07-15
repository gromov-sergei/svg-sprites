import type {
  NextAssetTarget,
  NextBundler,
  NextRouter,
  ReactAssetTarget,
  StandaloneAssetTarget,
  SpriteMode,
  SpriteAssetTarget,
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

export type StandaloneModeResultMetadata = {
  readonly target: StandaloneAssetTarget
}

export type FrameworkModeResultMetadata = {
  readonly target: SpriteAssetTarget
}

export type ModeResultMetadata = FrameworkModeResultMetadata | NextModeResultMetadata

export type OutputPlan = {
  readonly files: readonly GeneratedFile[]
  /** Создавать управляемый `.gitignore` для generated-каталога. По умолчанию: true. */
  readonly createGitignore?: boolean
  readonly paths: {
    readonly generatedDir: '.svg-sprite'
    readonly sprite: string
    readonly manifest: string
    readonly entry?: string
  }
  readonly result: ModeResultMetadata
}

export interface ModeAdapter<M extends SpriteMode = SpriteMode> {
  readonly mode: M
  generate(context: ModeAdapterContext): Promise<OutputPlan>
}
