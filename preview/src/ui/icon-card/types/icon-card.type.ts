import type { HTMLAttributes } from 'react'

/**
 * Параметры IconCard.
 */
export type IconCardParams = {
  /** Идентификатор иконки. */
  iconId: string
  /** Обработчик клика по карточке. */
  onSelect?: (iconId: string) => void
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'>

export type IconCardProps = RootAttrs & IconCardParams
