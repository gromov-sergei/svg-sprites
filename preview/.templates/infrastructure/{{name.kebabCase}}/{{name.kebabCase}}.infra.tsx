import cl from 'clsx'
import type { {{name.pascalCase}}InfraProps } from './types/{{name.kebabCase}}.type'
import styles from './styles/{{name.kebabCase}}.module.css'

/**
 * <Назначение инфраструктурного модуля {{name.pascalCase}} в 1 строке>.
 *
 * Используется для:
 *  - <сценарий 1>
 *  - <сценарий 2>
 */
export const {{name.pascalCase}}Infra = (props: {{name.pascalCase}}InfraProps) => {
  const { children, className, ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {children}
    </div>
  )
}
