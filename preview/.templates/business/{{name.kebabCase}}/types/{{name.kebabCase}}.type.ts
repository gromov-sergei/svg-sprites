import type { HTMLAttributes } from 'react'

/**
 * Параметры бизнес-модуля {{name.pascalCase}}.
 */
export type {{name.pascalCase}}BusinessParams = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}BusinessProps = RootAttrs & {{name.pascalCase}}BusinessParams
