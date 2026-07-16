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
import type { SpriteSourceContent } from '../compiler.js'
import type { ServerSpriteManifest } from '../release/types.js'

export type GeneratedFile = {
  readonly path: string
  readonly content: string | Uint8Array
}

export type PreparedLocalSprite = {
  readonly kind: 'local'
  readonly folder: SpriteFolder
  readonly iconNames: readonly string[]
}

export type PreparedContentSprite = {
  readonly kind: 'content'
  readonly name: string
  readonly sources: readonly SpriteSourceContent[]
  readonly iconNames: readonly string[]
}

export type PreparedRemoteSprite = {
  readonly kind: 'remote'
  readonly manifest: ServerSpriteManifest
  readonly manifestLocation: string
  readonly iconNames: readonly string[]
}

export type PreparedSprite = PreparedLocalSprite | PreparedContentSprite | PreparedRemoteSprite

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
  prepare?(config: ResolvedSpriteConfig): Promise<PreparedSprite>
  generate(context: ModeAdapterContext): Promise<OutputPlan>
}
