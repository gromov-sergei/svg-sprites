import type { HTMLAttributes } from 'react'

/**
 * Параметры CodeBlock.
 */
export type CodeBlockParams = {
  /** Код для отображения. */
  code: string
  /** Язык подсветки синтаксиса. */
  language?: 'html' | 'css' | 'xml'
  /** Показывать кнопку копирования. */
  copyable?: boolean
}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type CodeBlockProps = RootAttrs & CodeBlockParams
