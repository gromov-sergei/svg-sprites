export type SpriteViewerColorTheme = 'auto' | 'light' | 'dark'

export type SpriteViewerManifestColor = {
  variable: `--icon-color-${number}`
  fallback: string
}

export type SpriteViewerManifestIcon = {
  name: string
  id: string
  viewBox: string | null
  colors: readonly SpriteViewerManifestColor[]
}

export type SpriteViewerManifestUsage = {
  framework: 'react' | 'vue'
  componentName: string
}

/** Нормализованный manifest, который может отобразить framework-neutral Viewer. */
export type SpriteViewerManifest = {
  schemaVersion: 1
  generator: '@gromlab/svg-sprites'
  name: string
  description?: string
  mode?: string
  target: string
  format: 'stack' | 'symbol'
  iconCount: number
  spriteUrl: string
  icons: readonly SpriteViewerManifestIcon[]
  /** Текущее поле React/Next manifests. */
  componentName?: string
  /** Расширяемое описание framework-specific примера. */
  usage?: SpriteViewerManifestUsage
}

export type SpriteViewerManifestModule = {
  default?: SpriteViewerManifest
  spriteManifest?: SpriteViewerManifest
}

export type SpriteViewerManifestLoader = () => Promise<SpriteViewerManifest | SpriteViewerManifestModule>

export type SpriteViewerRemoteSource = {
  manifestUrl: string
  spriteUrl: string
}

export type SpriteViewerSource =
  | SpriteViewerManifest
  | SpriteViewerManifestModule
  | SpriteViewerManifestLoader
  | SpriteViewerRemoteSource

export type SpriteViewerSources =
  | readonly SpriteViewerSource[]
  | Readonly<Record<string, SpriteViewerSource>>

export type SpriteViewerElement = HTMLElement & {
  sources: SpriteViewerSources
  viewerTitle: string
  colorTheme: SpriteViewerColorTheme
  themeControlled: boolean
  showThemeToggle: boolean
  manifestUrl?: string
  spriteUrl?: string
}
