import cl from 'clsx'
import type { {{name.pascalCase}}LayoutProps } from './types/{{name.kebabCase}}.type'
import styles from './styles/{{name.kebabCase}}.module.css'

/**
 * <Назначение layout {{name.pascalCase}} в 1 строке>.
 *
 * Используется для:
 *  - <сценарий 1>
 *  - <сценарий 2>
 */
export const {{name.pascalCase}}Layout = (props: {{name.pascalCase}}LayoutProps) => {
  const { children, className, ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {children}
    </div>
  )
}
