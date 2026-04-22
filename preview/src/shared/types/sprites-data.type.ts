/**
 * CSS-переменная иконки.
 */
export type IconVar = {
  /** Имя CSS-переменной. */
  varName: string
  /** Fallback-значение. */
  fallback: string
  /** HEX-значение для color picker. */
  hex: string
  /** Является ли fallback значением currentColor. */
  isCurrentColor: boolean
}

/**
 * Размеры viewBox иконки.
 */
export type IconViewBox = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Данные одной иконки.
 */
export type IconData = {
  /** Идентификатор иконки. */
  id: string
  /** Имя группы (папки спрайта). */
  group: string
  /** Режим спрайта. */
  mode: 'stack' | 'symbol'
  /** Относительный путь к файлу спрайта. */
  spriteFile: string
  /** Размеры viewBox иконки. */
  viewBox: IconViewBox | null
  /** CSS-переменные иконки. */
  vars: IconVar[]
}

/**
 * Группа спрайтов.
 */
export type SpriteGroup = {
  /** Имя группы. */
  name: string
  /** Режим спрайта. */
  mode: 'stack' | 'symbol'
  /** Относительный путь к файлу спрайта. */
  spriteFile: string
  /** Иконки в группе. */
  icons: IconData[]
}

/**
 * Данные для рендера превью.
 */
export type SpritesData = {
  /** Группы спрайтов. */
  groups: SpriteGroup[]
}
