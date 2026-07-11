# Программный API: операционный reference

## Обязательная установка

```bash
npm install @gromlab/svg-sprites@latest
```

Программные imports требуют локальной dependency: `npx` их не заменяет. Этот reference всегда относится к latest API пакета.

## Когда открывать

Открывай этот документ, если генерация запускается из ESM build script, monorepo orchestration, собственного CLI или теста, а не напрямую package script. Для обычной интеграции предпочитай CLI references: [react-vite.md](react-vite.md), [react-webpack.md](react-webpack.md), [next-app.md](next-app.md), [next-pages.md](next-pages.md) или [legacy.md](legacy.md).

## Runtime и TypeScript

Основная точка входа только ESM и не импортирует React:

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'
```

Требуется Node.js 18+. Не используй `require()`. Для package subpath `@gromlab/svg-sprites/react` нужен TypeScript 5+ с `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

## React module

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'

const result = await generateReactSprite(
  'src/ui/file-manager/svg-sprite',
  'vite',
)
```

Сигнатура target:

```ts
type ReactAssetTarget = 'vite' | 'webpack'
```

`root` разрешается относительно текущего `process.cwd()`. Это выбранный каталог конкретного спрайта, а не обязательный module/feature-каталог. Внутри него функция загружает только `svg-sprite.config.ts`, объединяет `inputFolder` и `inputFiles`, компилирует `stack` и безопасно обновляет managed-файлы. Каждый такой config описывает один из потенциально многих спрайтов.

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

Передавай target явно. Значение вне union синхронно вызывает `Unsupported React asset target`.

## Next.js module

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

```ts
type NextSpriteGenerationOptions = {
  router: 'app' | 'pages'
  bundler: 'turbopack' | 'webpack'
}
```

Результат содержит поля React result, target `next@<router>/<bundler>`, а также `router` и `bundler`. Next generation всегда использует `stack` и включает root `viewBox`. Выбранные options должны совпадать с фактической Next build command.

## Config helpers и загрузчики

Helpers только возвращают объект и дают autocomplete; они не загружают файлы и не запускают валидацию:

```ts
import {
  defineLegacyConfig,
  defineNextSpriteConfig,
  defineReactSpriteConfig,
  loadLegacyConfig,
  loadReactSpriteConfig,
} from '@gromlab/svg-sprites'
```

```ts
const reactConfig = await loadReactSpriteConfig(
  'src/ui/file-manager/svg-sprite',
)

const legacyConfig = await loadLegacyConfig('.')
```

`loadReactSpriteConfig(root)` разрешает `inputFolder`/`inputFiles` от `root` и возвращает нормализованный config. Несмотря на название, тот же loader используется Next mode.

`loadLegacyConfig(cwd)` ищет `cwd/svg-sprites.config.ts`, валидирует его и превращает `output` и `sprites[].input` в absolute paths относительно `cwd`.

## Legacy generation

Прямой вызов:

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

```ts
type SpriteResult = {
  name: string
  format: 'symbol' | 'stack'
  spritePath: string
  iconCount: number
}
```

Важный path nuance: `generateLegacy(config)` не знает местоположение config-файла. Относительные `output` и `input` разрешаются от текущего `process.cwd()`. Если semantics должны совпасть с CLI для config в другом каталоге, сначала вызови loader:

```ts
const config = await loadLegacyConfig('config/sprites')
const results = await generateLegacy(config)
```

## Низкоуровневая компиляция

Основные exports:

```ts
import {
  compileSprite,
  compileSpriteContent,
  createShapeTransform,
  generatePreview,
  resolveSpriteEntry,
  resolveSprites,
} from '@gromlab/svg-sprites'
```

Минимальный in-memory пример:

```ts
import { compileSpriteContent, resolveSpriteEntry } from '@gromlab/svg-sprites'

const folder = resolveSpriteEntry({
  name: 'icons',
  input: 'src/assets/icons',
  format: 'stack',
})

const bytes = await compileSpriteContent(
  folder,
  {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  { rootViewBox: false },
)
```

`compileSpriteContent` возвращает `Promise<Uint8Array>` и не пишет на диск. `compileSprite(folder, outputDir, transform?, options?)` создаёт output directory и записывает `<folder.name>.sprite.svg`.

`CompileSpriteOptions.rootViewBox` по умолчанию `false`; стандартный Next preset передаёт `true`, React и legacy оставляют `false`. Не меняй эту опцию в попытке заменить target: она не определяет способ публикации asset.

`resolveSpriteEntry` и `resolveSprites` разрешают source paths относительно `process.cwd()`, проверяют existence и читают directory только на первом уровне. Они не применяют semantics локального `inputFolder + inputFiles`; для стандартных React/Next modules используй high-level generators.

`createShapeTransform(options)` возвращает callback transform для `svg-sprite`. Это integration primitive, а не функция `string -> string`.

`generatePreview(results, outputDir)` ожидает, что `results[].spritePath` уже существует, и пишет `preview.html` на основе package template. Не вызывай его до компиляции.

## React debug runtime

Viewer находится в отдельной client entry:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type {
  SpriteManifest,
  SpriteManifestLoader,
  SpriteManifestModule,
  SpriteViewerColorTheme,
  SpriteViewerProps,
  SpriteViewerSources,
} from '@gromlab/svg-sprites/react'
```

`SpriteViewerSources` принимает массив manifest/loader или record, например результат Vite `import.meta.glob`. Loader может вернуть manifest напрямую либо module с `default`/`spriteManifest`. Невалидный module завершится ошибкой `The loaded module does not export a valid SVG sprite manifest.`

Package React entry содержит `'use client'`; не импортируй его из server-only build scripts и production icon modules. Generated production component находится в выбранном каталоге спрайта.

## Оркестрация нескольких модулей

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'

const roots = [
  'src/ui/global/svg-sprite',
  'src/ui/file-manager/svg-sprite',
]

const results = await Promise.all(
  roots.map((root) => generateReactSprite(root, 'vite')),
)

if (results.some((result) => result.iconCount === 0)) {
  throw new Error('Пустой sprite module')
}
```

Не запускай разные targets параллельно для одного root: оба вызова владеют одинаковыми generated paths.

## Проверка и обработка ошибок

Запусти программную генерацию и typecheck проекта — это быстрые обязательные проверки. После вызова проверь `result.target`, `iconCount`, existence `spritePath`/`manifestPath`. Реальную bundler build и browser/Network-проверку добавляй только при изменении target/pipeline или диагностике runtime; не утверждай визуальный или a11y результат без доступных инструментов.

Типовые причины failure:

- unsupported target/router/bundler передан как unchecked string;
- `process.cwd()` отличается в monorepo runner, поэтому relative root указывает не туда;
- config не имеет default export;
- явно заданная `inputFolder` отсутствует;
- два source-файла дают одинаковый fragment ID;
- custom orchestration пытается перезаписать пользовательский файл в managed path;
- `generatePreview` не находит template при запуске из несобранных исходников package;
- сложный SVG требует отключения отдельных transforms по [complex-svg.md](complex-svg.md).
