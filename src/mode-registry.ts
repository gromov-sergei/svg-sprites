import type { ModeAdapter } from './core/mode-adapter.js'
import { nextAppTurbopackAdapter } from './modes/next-app-turbopack/adapter.js'
import { nextAppWebpackAdapter } from './modes/next-app-webpack/adapter.js'
import { nextPagesTurbopackAdapter } from './modes/next-pages-turbopack/adapter.js'
import { nextPagesWebpackAdapter } from './modes/next-pages-webpack/adapter.js'
import { reactViteAdapter } from './modes/react-vite/adapter.js'
import { reactWebpackAdapter } from './modes/react-webpack/adapter.js'
import type { SpriteMode } from './targets/types.js'

const modeRegistry: Record<SpriteMode, ModeAdapter> = {
  'react@vite': reactViteAdapter,
  'react@webpack': reactWebpackAdapter,
  'next@app/turbopack': nextAppTurbopackAdapter,
  'next@app/webpack': nextAppWebpackAdapter,
  'next@pages/turbopack': nextPagesTurbopackAdapter,
  'next@pages/webpack': nextPagesWebpackAdapter,
}

export function getModeAdapter(mode: SpriteMode): ModeAdapter {
  return modeRegistry[mode]
}
