import type { HTMLAttributes } from 'react'

/**
 * Параметры {{name.pascalCase}}.
 */
export type {{name.pascalCase}}Params = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}Props = RootAttrs & {{name.pascalCase}}Params
