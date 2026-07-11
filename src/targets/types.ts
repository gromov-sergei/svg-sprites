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

/** Любая среда, для которой может быть сгенерирован React sprite-модуль. */
export type SpriteAssetTarget = ReactAssetTarget | NextAssetTarget

/** Фрагменты кода, необходимые компоненту для получения URL SVG asset. */
export type SpriteAssetUrlCode = {
  /** Импорты, которые добавляются в начало generated-компонента. */
  imports: string[]
  /** Объявления, которые добавляются после импортов. */
  declarations: string[]
  /** Имя переменной, содержащей итоговый публичный URL SVG. */
  variableName: string
}
