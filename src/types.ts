/** Режим спрайта: stack или symbol. */
export type SpriteMode = 'stack' | 'symbol'

/** Результат парсинга имени папки со спрайтами. */
export interface SpriteFolder {
  /** Полное имя папки (как на диске, включая суффикс ?mode). */
  fullName: string
  /** Имя папки без суффикса режима. */
  name: string
  /** Режим спрайта. */
  mode: SpriteMode
  /** Абсолютный путь к папке. */
  path: string
  /** Абсолютные пути к SVG-файлам внутри папки. */
  files: string[]
}

/** Результат компиляции одного спрайта. */
export interface SpriteResult {
  /** Имя папки (без суффикса режима). */
  name: string
  /** Режим спрайта. */
  mode: SpriteMode
  /** Путь к сгенерированному SVG-спрайту. */
  spritePath: string
  /** Путь к сгенерированному .generated.ts файлу (если включена генерация типов). */
  typesPath: string | null
  /** Количество иконок в спрайте. */
  iconCount: number
}

/** Параметры трансформации SVG. */
export interface TransformOptions {
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

/** Параметры генерации спрайтов. */
export interface GenerateOptions {
  /** Путь к папке с исходными SVG (содержит подпапки-спрайты). */
  input: string
  /** Путь к папке для сгенерированных SVG-спрайтов. */
  output: string
  /**
   * Генерировать ли .generated.ts файлы с union-типами имён иконок.
   * По умолчанию: true.
   */
  types?: boolean
  /**
   * Куда складывать .generated.ts файлы.
   * По умолчанию: рядом с исходными папками (в input).
   */
  typesOutput?: string
  /**
   * Настройки трансформации SVG.
   * По умолчанию: все трансформации включены.
   */
  transform?: TransformOptions
  /**
   * Генерировать HTML-превью со всеми иконками.
   * По умолчанию: true.
   */
  preview?: boolean
}
