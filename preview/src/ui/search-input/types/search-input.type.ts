import type { InputHTMLAttributes } from 'react'

/**
 * Параметры SearchInput.
 */
export type SearchInputParams = {
  /** Обработчик изменения значения поиска. */
  onValueChange?: (value: string) => void
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export type SearchInputProps = RootAttrs & SearchInputParams
