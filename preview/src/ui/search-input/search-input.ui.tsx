import cl from 'clsx'
import type { SearchInputProps } from './types/search-input.type'
import styles from './styles/search-input.module.css'

/**
 * Поле поиска.
 *
 * Используется для:
 *  - фильтрации иконок по имени
 */
export const SearchInput = (props: SearchInputProps) => {
  const { className, onValueChange, ...htmlAttr } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onValueChange?.(e.target.value)
  }

  return (
    <input
      {...htmlAttr}
      type="search"
      autoComplete="off"
      onChange={handleChange}
      className={cl(styles.root, className)}
    />
  )
}
