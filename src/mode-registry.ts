import type { ModeAdapter } from './core/mode-adapter.js'
import { alpineViteAdapter } from './modes/alpine-vite/adapter.js'
import { alpineWebpackAdapter } from './modes/alpine-webpack/adapter.js'
import { angularApplicationAdapter } from './modes/angular-application/adapter.js'
import { angularWebpackAdapter } from './modes/angular-webpack/adapter.js'
import { astroViteAdapter } from './modes/astro-vite/adapter.js'
import { litViteAdapter } from './modes/lit-vite/adapter.js'
import { litWebpackAdapter } from './modes/lit-webpack/adapter.js'
import { nextAppTurbopackAdapter } from './modes/next-app-turbopack/adapter.js'
import { nextAppWebpackAdapter } from './modes/next-app-webpack/adapter.js'
import { nextPagesTurbopackAdapter } from './modes/next-pages-turbopack/adapter.js'
import { nextPagesWebpackAdapter } from './modes/next-pages-webpack/adapter.js'
import { nuxtViteAdapter } from './modes/nuxt-vite/adapter.js'
import { nuxtWebpackAdapter } from './modes/nuxt-webpack/adapter.js'
import { preactViteAdapter } from './modes/preact-vite/adapter.js'
import { preactWebpackAdapter } from './modes/preact-webpack/adapter.js'
import { qwikViteAdapter } from './modes/qwik-vite/adapter.js'
import { reactViteAdapter } from './modes/react-vite/adapter.js'
import { reactWebpackAdapter } from './modes/react-webpack/adapter.js'
import { standaloneAdapter } from './modes/standalone/adapter.js'
import { standaloneViteAdapter } from './modes/standalone-vite/adapter.js'
import { standaloneWebpackAdapter } from './modes/standalone-webpack/adapter.js'
import { solidStartViteAdapter } from './modes/solid-start-vite/adapter.js'
import { solidViteAdapter } from './modes/solid-vite/adapter.js'
import { solidWebpackAdapter } from './modes/solid-webpack/adapter.js'
import { svelteViteAdapter } from './modes/svelte-vite/adapter.js'
import { svelteWebpackAdapter } from './modes/svelte-webpack/adapter.js'
import { sveltekitViteAdapter } from './modes/sveltekit-vite/adapter.js'
import { vueViteAdapter } from './modes/vue-vite/adapter.js'
import { vueWebpackAdapter } from './modes/vue-webpack/adapter.js'
import type { SpriteMode } from './targets/types.js'

const modeRegistry: Record<SpriteMode, ModeAdapter> = {
  standalone: standaloneAdapter,
  'standalone@vite': standaloneViteAdapter,
  'standalone@webpack': standaloneWebpackAdapter,
  'react@vite': reactViteAdapter,
  'react@webpack': reactWebpackAdapter,
  'vue@vite': vueViteAdapter,
  'vue@webpack': vueWebpackAdapter,
  'nuxt@vite': nuxtViteAdapter,
  'nuxt@webpack': nuxtWebpackAdapter,
  'svelte@vite': svelteViteAdapter,
  'svelte@webpack': svelteWebpackAdapter,
  'sveltekit@vite': sveltekitViteAdapter,
  'angular@application': angularApplicationAdapter,
  'angular@webpack': angularWebpackAdapter,
  'astro@vite': astroViteAdapter,
  'solid@vite': solidViteAdapter,
  'solid@webpack': solidWebpackAdapter,
  'solid-start@vite': solidStartViteAdapter,
  'preact@vite': preactViteAdapter,
  'preact@webpack': preactWebpackAdapter,
  'qwik@vite': qwikViteAdapter,
  'lit@vite': litViteAdapter,
  'lit@webpack': litWebpackAdapter,
  'alpine@vite': alpineViteAdapter,
  'alpine@webpack': alpineWebpackAdapter,
  'next@app/turbopack': nextAppTurbopackAdapter,
  'next@app/webpack': nextAppWebpackAdapter,
  'next@pages/turbopack': nextPagesTurbopackAdapter,
  'next@pages/webpack': nextPagesWebpackAdapter,
}

export function getModeAdapter(mode: SpriteMode): ModeAdapter {
  return modeRegistry[mode]
}
