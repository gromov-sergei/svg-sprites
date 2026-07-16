import type { SpriteMode } from './targets/types.js'

export type SpriteSource = 'local' | 'remote'

/** HTTP SVG input серверного mode. Имя задаёт публичное имя иконки. */
export type ServerSvgInput = {
  name: string
  url: string
  sha256?: string
}

export type SpriteInput = string | ServerSvgInput

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

/** Единая конфигурация sprite-модуля. Exact mode уточняет допустимый input. */
export type SpriteConfig = {
  /** Режим можно определить в конфиге либо передать через CLI/API. */
  mode?: SpriteMode
  /** Локальные SVG по умолчанию либо готовый server manifest. */
  source?: SpriteSource
  /** Логическое имя спрайта. По умолчанию выводится из каталога модуля. */
  name?: string
  /** Описание спрайта для generated types и manifest. */
  description?: string
  /** Путь или glob-шаблоны исходных SVG относительно корня модуля. По умолчанию: ./icons. */
  input?: SpriteInput | SpriteInput[]
  /** Настройки трансформации SVG. По умолчанию все включены. */
  transform?: TransformOptions
  /** Добавлять развёрнутое предупреждение в generated-файлы. По умолчанию: true. */
  generatedNotice?: boolean
}

/** Полностью разрешённая конфигурация, готовая к генерации. */
export type ResolvedSpriteConfig = {
  mode: SpriteMode
  source: SpriteSource
  name: string
  description?: string
  input: SpriteInput[]
  transform: Required<TransformOptions>
  generatedNotice: boolean
}

/** Результат парсинга спрайта — данные для компиляции. */
export type SpriteFolder = {
  /** Имя спрайта. */
  name: string
  /** Формат спрайта. */
  format: SpriteFormat
  /** Абсолютный путь для единственного input-каталога, иначе null. */
  path: string | null
  /** Абсолютные пути к SVG-файлам. */
  files: string[]
}
