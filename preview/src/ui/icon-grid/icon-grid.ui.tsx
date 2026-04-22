import cl from 'clsx'
import { IconCard } from '../icon-card'
import type { IconGridProps } from './types/icon-grid.type'
import styles from './styles/icon-grid.module.css'

/**
 * Сетка иконок, сгруппированная по спрайтам.
 *
 * Используется для:
 *  - отображения всех иконок из всех спрайтов
 *  - фильтрации иконок по поисковому запросу
 */
export const IconGrid = (props: IconGridProps) => {
  const { groups, searchQuery = '', onIconSelect, className, ...htmlAttr } = props

  const query = searchQuery.toLowerCase()

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {groups.map((group) => {
        const filteredIcons = query
          ? group.icons.filter((icon) => icon.id.includes(query))
          : group.icons

        const isGroupHidden = filteredIcons.length === 0

        return (
          <section
            key={group.name}
            className={cl(styles.group, isGroupHidden && styles._hidden)}
          >
            <h2 className={styles.groupHeader}>
              {group.name}
              <span className={styles.badge}>{group.mode}</span>
              <span className={styles.count}>{group.icons.length}</span>
            </h2>
            <div className={styles.grid}>
              {filteredIcons.map((icon) => (
                <IconCard
                  key={icon.id}
                  iconId={icon.id}
                  onSelect={onIconSelect}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
