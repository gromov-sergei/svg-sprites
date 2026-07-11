/** Формат спрайта: stack или symbol. */
export type SpriteFormat = 'stack' | 'symbol'

/** Описание одного спрайта в конфиге. */
export type SpriteEntry = {
  /** Уникальное имя спрайта (используется как имя файла и в типах). */
  name: string
  /**
   * Источник SVG-файлов.
   * Строка — путь к папке с SVG-файлами.
   * Массив — пути к конкретным SVG-файлам.
   */
  input: string | string[]
  /**
   * Формат спрайта.
   * По умолчанию: 'stack'.
   */
  format?: SpriteFormat
}

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

/** Конфигурация генерации SVG-спрайтов. */
export type SvgSpritesConfig = {
  /** Путь к папке для сгенерированных SVG-спрайтов. */
  output: string
  /**
   * Генерировать HTML-превью со всеми иконками.
   * По умолчанию: true.
   */
  preview?: boolean
  /**
   * Настройки трансформации SVG.
   * По умолчанию: все трансформации включены.
   */
  transform?: TransformOptions
  /** Список спрайтов для генерации. */
  sprites: SpriteEntry[]
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

/** Результат компиляции одного спрайта. */
export type SpriteResult = {
  /** Имя спрайта. */
  name: string
  /** Формат спрайта. */
  format: SpriteFormat
  /** Путь к сгенерированному SVG-спрайту. */
  spritePath: string
  /** Количество иконок в спрайте. */
  iconCount: number
}
