import type { NextAssetTarget, ReactAssetTarget, ReactSpriteMode } from '../targets/types.js'

export type SpriteManifestColor = {
  variable: `--icon-color-${number}`
  fallback: string
}

export type SpriteManifestIcon = {
  name: string
  id: string
  viewBox: string | null
  colors: readonly SpriteManifestColor[]
}

/** Публичные данные одного сгенерированного React-спрайта. */
export type SpriteManifest = {
  schemaVersion: 1
  generator: '@gromlab/svg-sprites'
  name: string
  description?: string
  componentName: string
  mode?: ReactSpriteMode | NextAssetTarget
  target: ReactAssetTarget | NextAssetTarget
  format: 'stack' | 'symbol'
  iconCount: number
  spriteUrl: string
  icons: readonly SpriteManifestIcon[]
}

export type SpriteManifestModule = {
  default?: SpriteManifest
  spriteManifest?: SpriteManifest
}

export type SpriteManifestLoader = () => Promise<SpriteManifest | SpriteManifestModule>
export type SpriteViewerSource = SpriteManifest | SpriteManifestLoader

/** Массив источников либо результат import.meta.glob. */
export type SpriteViewerSources =
  | readonly SpriteViewerSource[]
  | Readonly<Record<string, SpriteViewerSource>>
