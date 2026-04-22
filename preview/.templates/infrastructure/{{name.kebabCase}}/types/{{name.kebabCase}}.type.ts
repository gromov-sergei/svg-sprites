import type { HTMLAttributes } from 'react'

/**
 * Параметры инфраструктурного модуля {{name.pascalCase}}.
 */
export type {{name.pascalCase}}InfraParams = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}InfraProps = RootAttrs & {{name.pascalCase}}InfraParams
