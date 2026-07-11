# Программный API

[← Главная](../../README_RU.md)

Пакет предоставляет основную Node.js точку входа и отдельный React runtime entry. Обе точки распространяются только как ESM и подключаются через `import`.

Для разрешения `@gromlab/svg-sprites/react` в TypeScript используйте `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

## Основной entry

```ts
import {
  defineNextSpriteConfig,
  defineReactSpriteConfig,
  generateNextSprite,
  generateReactSprite,
} from '@gromlab/svg-sprites'
```

Основной entry не импортирует React и может использоваться в CLI, build scripts и Node.js инструментах.

## `generateReactSprite`

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'

const result = await generateReactSprite(
  'src/ui/file-manager/svg-sprite',
  'vite',
)
```

Второй аргумент обязателен:

```ts
type ReactAssetTarget = 'vite' | 'webpack'
```

Результат:

```ts
type ReactSpriteGenerationResult = {
  name: string
  rootDir: string
  generatedDir: string
  spritePath: string
  manifestPath: string
  iconCount: number
  target: 'vite' | 'webpack'
}
```

```ts
console.log(result.name)
console.log(result.iconCount)
console.log(result.spritePath)
console.log(result.manifestPath)
```

Функция загружает `svg-sprite.config.ts` из указанного корня, компилирует SVG и безопасно обновляет managed-файлы.

## `generateNextSprite`

```ts
import { generateNextSprite } from '@gromlab/svg-sprites'

const result = await generateNextSprite(
  'src/ui/file-manager/svg-sprite',
  {
    router: 'app',
    bundler: 'turbopack',
  },
)
```

Доступные значения:

```ts
type NextSpriteGenerationOptions = {
  router: 'app' | 'pages'
  bundler: 'turbopack' | 'webpack'
}
```

Результат дополнительно содержит выбранные `router`, `bundler` и полный target вида `next@app/turbopack`.

## `defineReactSpriteConfig`

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: [
    '../../shared/icons/check.svg',
  ],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

`inputFolder` и `inputFiles` объединяются. Хелпер возвращает конфиг без runtime-преобразований и предоставляет TypeScript autocomplete.

## `defineNextSpriteConfig`

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
})
```

Next.js использует тот же контракт конфигурации, что и React presets.

## `generateLegacy`

```ts
import { generateLegacy } from '@gromlab/svg-sprites'

const results = await generateLegacy({
  output: 'public/sprites',
  preview: false,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
  ],
})
```

Возвращается массив:

```ts
type SpriteResult = {
  name: string
  format: 'symbol' | 'stack'
  spritePath: string
  iconCount: number
}
```

Подробнее: [Legacy mode](legacy.md).

## Низкоуровневые функции

Основная точка входа также экспортирует:

```ts
import {
  compileSprite,
  compileSpriteContent,
  createShapeTransform,
  generatePreview,
  loadLegacyConfig,
  loadReactSpriteConfig,
  resolveSpriteEntry,
  resolveSprites,
} from '@gromlab/svg-sprites'
```

Эти функции предназначены для собственного orchestration поверх существующего compiler и writer. Для стандартного использования предпочтительны `generateReactSprite` и `generateLegacy`.

## React runtime entry

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
```

Типы:

```ts
import type {
  SpriteManifest,
  SpriteManifestColor,
  SpriteManifestIcon,
  SpriteManifestLoader,
  SpriteManifestModule,
  SpriteViewerColorTheme,
  SpriteViewerProps,
  SpriteViewerSource,
  SpriteViewerSources,
} from '@gromlab/svg-sprites/react'
```

React entry содержит `'use client'` и предназначен для debug-инструментов. Generated production-компоненты импортируются из локальных sprite-модулей приложения, а не из React entry пакета.

`SpriteViewerProps.colorTheme` принимает `auto | light | dark`. Значение `auto` используется по умолчанию и следует `prefers-color-scheme`; для синхронизации с темой приложения передавайте вычисленное `light` или `dark`.

## Связанные руководства

- [React + Vite](react-vite.md)
- [React + Webpack 5](react-webpack.md)
