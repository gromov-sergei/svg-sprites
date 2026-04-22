import type { HTMLAttributes } from 'react'
import type { IconData } from '../../../shared/types'

/**
 * Параметры IconModal.
 */
export type IconModalParams = {
  /** Данные иконки для отображения. null — модалка закрыта. */
  icon: IconData | null
  /** Имя спрайта по умолчанию (первый из конфига). */
  defaultSprite?: string
  /** Обработчик закрытия модалки. */
  onClose: () => void
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type IconModalProps = RootAttrs & IconModalParams
