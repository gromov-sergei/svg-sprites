/**
 * Asset target для Vite.
 *
 * Генерирует статический импорт SVG с query `?no-inline`, чтобы Vite всегда
 * выпускал спрайт отдельным кешируемым файлом и не преобразовывал его в data URL.
 */
export type ViteAssetTarget = 'vite'

/**
 * Asset target для Webpack 5.
 *
 * Генерирует статический `new URL(..., import.meta.url)`. Webpack обрабатывает
 * такую ссылку через Asset Modules и выпускает SVG отдельным файлом.
 */
export type WebpackAssetTarget = 'webpack'

/** Target серверной сборки immutable sprite release. */
export type ServerAssetTarget = 'server'

/** Asset target для проекта без сборщика. */
export type StaticAssetTarget = 'static'

/** Роутер Next.js, для которого генерируется sprite-модуль. */
export type NextRouter = 'app' | 'pages'

/** Сборщик Next.js, обрабатывающий SVG asset. */
export type NextBundler = 'turbopack' | 'webpack'

/** Полный ключ Next.js target, используемый CLI и manifest. */
export type NextAssetTarget = `next@${NextRouter}/${NextBundler}`

/**
 * Среда сборки React sprite-модуля.
 *
 * Target определяет только способ получения публичного URL SVG asset.
 * Состав иконок, React API и структура generated-файлов от него не зависят.
 */
export type ReactAssetTarget = ViteAssetTarget | WebpackAssetTarget

/** Полный ключ React mode, используемый конфигом, CLI и manifest. */
export type ReactSpriteMode = `react@${ReactAssetTarget}`

/** Среда сборки Vue sprite-модуля. */
export type VueAssetTarget = ViteAssetTarget

/** Полный ключ Vue mode, используемый конфигом, CLI и manifest. */
export type VueSpriteMode = `vue@${ViteAssetTarget | WebpackAssetTarget}`

export type NuxtSpriteMode = `nuxt@${ViteAssetTarget | WebpackAssetTarget}`
export type SvelteSpriteMode = `svelte@${ViteAssetTarget | WebpackAssetTarget}` | 'sveltekit@vite'
export type AngularAssetTarget = 'application' | WebpackAssetTarget
export type AngularSpriteMode = `angular@${AngularAssetTarget}`
export type AstroSpriteMode = 'astro@vite'
export type SolidSpriteMode = `solid@${ViteAssetTarget | WebpackAssetTarget}` | 'solid-start@vite'
export type PreactSpriteMode = `preact@${ViteAssetTarget | WebpackAssetTarget}`
export type QwikSpriteMode = 'qwik@vite'
export type LitSpriteMode = `lit@${ViteAssetTarget | WebpackAssetTarget}`
export type AlpineSpriteMode = `alpine@${ViteAssetTarget | WebpackAssetTarget}`

/** Среда standalone sprite-модуля. */
export type StandaloneAssetTarget = StaticAssetTarget | ViteAssetTarget | WebpackAssetTarget

/** Полный ключ standalone mode, используемый конфигом, CLI и manifest. */
export type StandaloneSpriteMode = 'standalone' | `standalone@${ViteAssetTarget | WebpackAssetTarget}`

/** Серверный mode, публикующий готовые sprite profiles и manifest. */
export type ServerSpriteMode = 'standalone@server'

/** Любая среда, для которой может быть сгенерирован React sprite-модуль. */
export type SpriteAssetTarget = ReactAssetTarget | NextAssetTarget | StaticAssetTarget | AngularAssetTarget | ServerAssetTarget

/** Режим генерации sprite-модуля. */
export type SpriteMode =
  | ReactSpriteMode
  | VueSpriteMode
  | NuxtSpriteMode
  | SvelteSpriteMode
  | AngularSpriteMode
  | AstroSpriteMode
  | SolidSpriteMode
  | PreactSpriteMode
  | QwikSpriteMode
  | LitSpriteMode
  | AlpineSpriteMode
  | NextAssetTarget
  | StandaloneSpriteMode
  | ServerSpriteMode

/** Фрагменты кода, необходимые компоненту для получения URL SVG asset. */
export type SpriteAssetUrlCode = {
  /** Импорты, которые добавляются в начало generated-компонента. */
  imports: string[]
  /** Объявления, которые добавляются после импортов. */
  declarations: string[]
  /** Имя переменной, содержащей итоговый публичный URL SVG. */
  variableName: string
}
