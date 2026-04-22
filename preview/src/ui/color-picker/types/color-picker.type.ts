import type { HTMLAttributes } from 'react'

/**
 * Параметры ColorPicker.
 */
export type ColorPickerParams = {
  /** Текущий цвет в HEX. */
  value: string
  /** Обработчик изменения цвета. */
  onValueChange: (color: string) => void
  /** Подпись под picker-ом. */
  label?: string
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>

export type ColorPickerProps = RootAttrs & ColorPickerParams
