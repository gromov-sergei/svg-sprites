import cl from 'clsx'
import type { {{name.pascalCase}}ScreenProps } from './types/{{name.kebabCase}}.type'
import styles from './styles/{{name.kebabCase}}.module.css'

/**
 * <Назначение экрана {{name.pascalCase}} в 1 строке>.
 *
 * Используется для:
 *  - <сценарий 1>
 *  - <сценарий 2>
 */
export const {{name.pascalCase}}Screen = (props: {{name.pascalCase}}ScreenProps) => {
  const { children, className, ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {children}
    </div>
  )
}
