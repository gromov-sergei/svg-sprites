import type { SpriteMode } from './targets/types.js'

/** Формат спрайта: stack или symbol. */
export type SpriteFormat = 'stack' | 'symbol'

/** Параметры трансформации SVG. Все включены по умолчанию. */
export type TransformOptions = {
  /**
   * Удалять width/height с корневого <svg>.
   * По умолчанию: true.
   */
  removeSize?: boolean
  /**
   * Заменять цвета на CSS-переменные var(--icon-color-N, ...).
   * Моно-иконка: var(--icon-color-1, currentColor).
   * Мульти-иконка: var(--icon-color-N, #original).
   * По умолчанию: true.
   */
  replaceColors?: boolean
  /**
   * Добавлять transition:fill 0.3s,stroke 0.3s к элементам с цветом.
   * По умолчанию: true.
   */
  addTransition?: boolean
}

/** Единая конфигурация локального sprite-модуля. */
export type SpriteConfig = {
  /** Режим можно определить в конфиге либо передать через CLI/API. */
  mode?: SpriteMode
  /** Логическое имя спрайта. По умолчанию выводится из каталога модуля. */
  name?: string
  /** Описание спрайта для generated types и manifest. */
  description?: string
  /** Папка с исходными SVG относительно корня модуля. По умолчанию: ./icons. */
  inputFolder?: string
  /** Дополнительные SVG-файлы относительно корня модуля. По умолчанию: []. */
  inputFiles?: string[]
  /** Настройки трансформации SVG. По умолчанию все включены. */
  transform?: TransformOptions
  /** Добавлять развёрнутое предупреждение в generated-файлы. По умолчанию: true. */
  generatedNotice?: boolean
}

/** Полностью разрешённая конфигурация, готовая к генерации. */
export type ResolvedSpriteConfig = {
  mode: SpriteMode
  name: string
  description?: string
  inputFolder: string | null
  inputFiles: string[]
  transform: Required<TransformOptions>
  generatedNotice: boolean
}

/** Результат парсинга спрайта — данные для компиляции. */
export type SpriteFolder = {
  /** Имя спрайта. */
  name: string
  /** Формат спрайта. */
  format: SpriteFormat
  /** Абсолютный путь к папке (для input-папки) или null (для input-массива). */
  path: string | null
  /** Абсолютные пути к SVG-файлам. */
  files: string[]
}
