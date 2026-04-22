import cl from 'clsx'
import type { {{name.pascalCase}}WidgetProps } from './types/{{name.kebabCase}}.type'
import styles from './styles/{{name.kebabCase}}.module.css'

/**
 * <Назначение виджета {{name.pascalCase}} в 1 строке>.
 *
 * Используется для:
 *  - <сценарий 1>
 *  - <сценарий 2>
 */
export const {{name.pascalCase}}Widget = (props: {{name.pascalCase}}WidgetProps) => {
  const { children, className, ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {children}
    </div>
  )
}
