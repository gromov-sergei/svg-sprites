import type { HTMLAttributes } from 'react'
import type { SpriteGroup } from '../../../shared/types'

/**
 * Параметры IconGrid.
 */
export type IconGridParams = {
  /** Группы спрайтов для отображения. */
  groups: SpriteGroup[]
  /** Строка поиска для фильтрации. */
  searchQuery?: string
  /** Обработчик выбора иконки. */
  onIconSelect?: (iconId: string) => void
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type IconGridProps = RootAttrs & IconGridParams
