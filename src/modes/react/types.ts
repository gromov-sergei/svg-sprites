import type {
  ReactAssetTarget,
  SpriteAssetTarget,
} from '../../targets/types.js'
import type { TransformOptions } from '../../types.js'

export type ReactSpriteConfig = {
  /** Логическое имя спрайта. По умолчанию выводится из пути модуля. */
  name?: string
  /** Описание спрайта для документации и будущего инспектора. */
  description?: string
  /** Папка с исходными SVG относительно svg-sprite.config.ts. По умолчанию: ./icons. */
  inputFolder?: string
  /** Дополнительные SVG-файлы относительно svg-sprite.config.ts. По умолчанию: []. */
  inputFiles?: string[]
  /** Настройки трансформации SVG. По умолчанию все трансформации включены. */
  transform?: TransformOptions
  /** Добавлять развёрнутое предупреждение в generated-файлы. По умолчанию: true. */
  generatedNotice?: boolean
}

export type ResolvedReactSpriteConfig = {
  name: string
  description?: string
  inputFolder: string | null
  inputFiles: string[]
  transform: TransformOptions
  generatedNotice: boolean
}

export type SpriteModuleGenerationResult<TTarget extends SpriteAssetTarget> = {
  name: string
  rootDir: string
  generatedDir: string
  spritePath: string
  manifestPath: string
  iconCount: number
  /** Среда, для которой сгенерирован способ получения URL SVG asset. */
  target: TTarget
}

export type ReactSpriteGenerationResult = SpriteModuleGenerationResult<ReactAssetTarget>
