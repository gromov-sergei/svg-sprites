import type { HTMLAttributes } from 'react'

/**
 * Параметры Banner.
 */
export type BannerParams = {
  /** Вариант отображения. */
  variant?: 'warn' | 'info'
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type BannerProps = RootAttrs & BannerParams
