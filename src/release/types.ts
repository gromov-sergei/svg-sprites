import type { CompiledIcon } from '../core/compiled-artifact.js'
import type { TransformOptions } from '../types.js'

export type SpriteCompileProfile = 'stack' | 'stack-root-viewbox'

export type ServerSpriteAsset = {
  readonly href: string
  readonly sha256: string
  readonly byteLength: number
}

export type ServerSpriteManifest = {
  readonly kind: '@gromlab/svg-sprites/server'
  readonly schemaVersion: 1
  readonly generator: '@gromlab/svg-sprites'
  readonly mode: 'standalone@server'
  readonly target: 'server'
  readonly name: string
  readonly description?: string
  readonly format: 'stack'
  readonly generatedNotice: boolean
  readonly transform: Required<TransformOptions>
  readonly iconCount: number
  readonly icons: readonly CompiledIcon[]
  readonly sprites: Readonly<Record<SpriteCompileProfile, ServerSpriteAsset>>
}
