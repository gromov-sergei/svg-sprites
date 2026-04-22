import cl from 'clsx'
import type { IconCardProps } from './types/icon-card.type'
import styles from './styles/icon-card.module.css'

/**
 * Карточка иконки в сетке превью.
 *
 * Используется для:
 *  - отображения иконки из спрайта с именем
 *  - открытия модалки деталей по клику
 */
export const IconCard = (props: IconCardProps) => {
  const { iconId, onSelect, className, ...htmlAttr } = props

  const handleClick = (): void => {
    onSelect?.(iconId)
  }

  return (
    <div {...htmlAttr} className={cl(styles.root, className)} onClick={handleClick}>
      <div className={styles.iconWrap}>
        <svg className={styles.icon}>
          <use href={`#${iconId}`} />
        </svg>
      </div>
      <span className={styles.name}>{iconId}</span>
    </div>
  )
}
