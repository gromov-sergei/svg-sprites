import type { NextAssetTarget, ReactAssetTarget, ReactSpriteMode } from '../targets/types.js'
import type {
  SpriteViewerManifest,
  SpriteViewerManifestColor,
  SpriteViewerManifestIcon,
  SpriteViewerManifestLoader,
  SpriteViewerManifestModule,
  SpriteViewerSource,
  SpriteViewerSources,
} from '../viewer/types.js'

export type SpriteManifestColor = SpriteViewerManifestColor
export type SpriteManifestIcon = SpriteViewerManifestIcon

/** Публичные данные одного сгенерированного React- или Next.js-спрайта. */
export type SpriteManifest = SpriteViewerManifest & {
  componentName: string
  mode?: ReactSpriteMode | NextAssetTarget
  target: ReactAssetTarget | NextAssetTarget
}

export type SpriteManifestModule = SpriteViewerManifestModule
export type SpriteManifestLoader = SpriteViewerManifestLoader
export type { SpriteViewerSource, SpriteViewerSources }
