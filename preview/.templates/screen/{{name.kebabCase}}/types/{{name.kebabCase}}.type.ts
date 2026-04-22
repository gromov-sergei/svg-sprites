import type { HTMLAttributes } from 'react'

/**
 * Параметры экрана {{name.pascalCase}}.
 */
export type {{name.pascalCase}}ScreenParams = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}ScreenProps = RootAttrs & {{name.pascalCase}}ScreenParams
