import type { StandaloneSpriteMode } from './targets/types.js'

export type StandaloneSpriteManifestColor = {
  variable: `--icon-color-${number}`
  fallback: string
}

export type StandaloneSpriteManifestIcon = {
  name: string
  id: string
  viewBox: string | null
  colors: readonly StandaloneSpriteManifestColor[]
}

export type StandaloneTargetForMode<M extends StandaloneSpriteMode> =
  M extends 'standalone'
    ? 'static'
    : M extends 'standalone@vite'
      ? 'vite'
      : 'webpack'

/** Deployment-neutral данные standalone-спрайта. */
export type StandaloneSpriteManifestData<
  M extends StandaloneSpriteMode = StandaloneSpriteMode,
> = {
  schemaVersion: 1
  generator: '@gromlab/svg-sprites'
  name: string
  description?: string
  mode: M
  target: StandaloneTargetForMode<M>
  format: 'stack' | 'symbol'
  iconCount: number
  icons: readonly StandaloneSpriteManifestIcon[]
}

/** Standalone manifest с публичным URL опубликованного SVG. */
export type StandaloneSpriteManifest<
  M extends StandaloneSpriteMode = StandaloneSpriteMode,
> = StandaloneSpriteManifestData<M> & {
  spriteUrl: string
}
