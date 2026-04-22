import cl from 'clsx'
import type { BannerProps } from './types/banner.type'
import styles from './styles/banner.module.css'

/**
 * Баннер-уведомление.
 *
 * Используется для:
 *  - предупреждений о file:// протоколе
 *  - информационных сообщений
 */
export const Banner = (props: BannerProps) => {
  const { children, className, variant = 'warn', ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, variant && styles[`_${variant}`], className)}>
      {children}
    </div>
  )
}
