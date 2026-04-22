import type { HTMLAttributes } from 'react'

/**
 * Параметры виджета {{name.pascalCase}}.
 */
export type {{name.pascalCase}}WidgetParams = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}WidgetProps = RootAttrs & {{name.pascalCase}}WidgetParams
