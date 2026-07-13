# Программный API

[← Главная](../../README_RU.md)

Пакет распространяется как ESM и предоставляет единый Node.js API генерации. React runtime с `SpriteViewer` находится в отдельной точке входа `@gromlab/svg-sprites/react`.

## `generateSprite`

```ts
import { generateSprite } from '@gromlab/svg-sprites'

const result = await generateSprite(
  'src/ui/file-manager/svg-sprite/svg-sprite.config.ts',
)
```

Первый аргумент принимает полный путь к config-файлу с любым именем и расширением `.ts`, `.js` или `.json`. Каталог вместо файла включает config-less режим: корнем sprite-модуля становится этот каталог.

Второй аргумент содержит необязательные overrides и всегда имеет приоритет над конфигом:

```ts
await generateSprite('src/ui/file-manager/svg-sprite/custom-config.json', {
  mode: 'react@webpack',
  name: 'documents',
  inputFolder: './assets',
  inputFiles: ['../../shared/search.svg'],
  transform: {
    addTransition: false,
  },
  generatedNotice: false,
})
```

Порядок разрешения настроек:

```text
defaults → config → API overrides
```

Для полностью программной генерации передайте каталог и все обязательные настройки через overrides:

```ts
await generateSprite('src/ui/file-manager/svg-sprite', {
  mode: 'react@vite',
  name: 'file-manager',
  inputFiles: [
    '../../shared/search.svg',
    '../../shared/settings.svg',
  ],
})
```

## Конфигурация

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../shared/check.svg'],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

`defineSpriteConfig` является identity helper для TypeScript autocomplete. JS может экспортировать тот же объект через `export default`, а JSON содержит объект непосредственно.

## Специализированные обёртки

Специализированные функции доступны как обёртки над `generateSprite`:

```ts
import { generateNextSprite, generateReactSprite } from '@gromlab/svg-sprites'

await generateReactSprite('path/to/config.ts', 'vite')
await generateNextSprite('path/to/config.ts', {
  router: 'app',
  bundler: 'turbopack',
})
```

Явно переданный target перекрывает `mode` из файла. Для нового кода используйте `generateSprite`.

## Config API

```ts
import {
  loadSpriteConfig,
  resolveSpriteConfig,
  validateSpriteConfig,
} from '@gromlab/svg-sprites'
```

- `loadSpriteConfig(file)` загружает явно указанный `.ts`, `.js` или `.json` файл.
- `validateSpriteConfig(value)` выполняет runtime-валидацию объекта.
- `resolveSpriteConfig(root, config, overrides)` объединяет значения, добавляет defaults и разрешает пути относительно `root`.

## Низкоуровневый compiler

```ts
import {
  compileSprite,
  compileSpriteContent,
  createShapeTransform,
} from '@gromlab/svg-sprites'
```

Эти функции предназначены для собственного orchestration. Стандартная генерация должна выполняться через `generateSprite`.

## React runtime

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
```

`SpriteViewer` принимает generated manifests, lazy loaders или результат `import.meta.glob`. Эта точка входа содержит `'use client'` и предназначена для debug-инструментов; production-компоненты импортируются из локальных sprite-модулей приложения.
