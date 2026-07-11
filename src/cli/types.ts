import type { NextAssetTarget, ReactAssetTarget } from '../targets/types.js'

/** Корневой режим генерации, определяющий структуру создаваемых файлов. */
export type GenerationMode = 'legacy' | 'next' | 'react'

/** Аргументы legacy pipeline. */
export type LegacyCliArgs = {
  mode: 'legacy'
  path: string
}

/** Аргументы React pipeline с обязательной средой обработки SVG asset. */
export type ReactCliArgs = {
  mode: 'react'
  path: string
  target: ReactAssetTarget
}

/** Аргументы Next.js pipeline с явно выбранными роутером и сборщиком. */
export type NextCliArgs = {
  mode: 'next'
  path: string
  target: NextAssetTarget
}

export type CliArgs = LegacyCliArgs | NextCliArgs | ReactCliArgs
