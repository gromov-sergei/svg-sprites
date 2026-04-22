import type { HTMLAttributes } from 'react'

/**
 * Параметры {{name.pascalCase}}Layout.
 */
export type {{name.pascalCase}}LayoutParams = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}LayoutProps = RootAttrs & {{name.pascalCase}}LayoutParams
