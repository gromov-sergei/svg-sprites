# Next.js App Router: операционный reference

## Когда открывать

Открывай этот документ, если приложение использует каталог `app/` или `src/app/` и нужен generated-компонент для Server Components, SSR или SSG. Сначала установи реальный сборщик: target для Turbopack и Webpack различается. Для `pages/` используй [next-pages.md](next-pages.md).

## Матрица target

| Сборщик | CLI mode |
|---|---|
| Turbopack | `next@app/turbopack` |
| Webpack 5 | `next@app/webpack` |

Не выводи target только из наличия `next.config.*`. Проверь фактические flags в `dev`/`build`. Mode генератора и сборщик контрольной сборки должны совпадать.

## Подготовка каталога спрайта

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Установи пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
})
```

- Каталог выбирает проект конкретного спрайта и не обязан быть module/feature-каталогом. Каждый config описывает один из потенциально многих спрайтов приложения.
- Конфиг называется в единственном числе: `svg-sprite.config.ts`.
- Пути считаются от его каталога; `inputFolder` сканируется нерекурсивно.
- Локальная папка и `inputFiles` объединяются. Одинаковые basename разных файлов запрещены.
- Если имя не задано, оно выводится из каталога: для папки `svg-sprite` берётся имя родительской папки. Явное `name` надёжнее при перемещениях.
- `name` должен быть kebab-case и начинаться с буквы.
- `FileManagerIcon` ниже — только пример generated-имени из `name: 'file-manager'`.
- Next preset всегда генерирует `stack` и включает root `viewBox` спрайта; это не пользовательская настройка.

## Генерация

Пример scripts для Turbopack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@app/turbopack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Для Webpack замени только mode целиком на `next@app/webpack`. Не запускай два target последовательно для одного каталога: второй перезапишет generated target первого. Для первой генерации запусти `npm run sprite:file-manager`.

## Server Component

Generated production component не содержит `'use client'`. Импортируй его непосредственно в server `page.tsx` или `layout.tsx`:

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function Page() {
  return (
    <main>
      <FileManagerIcon icon="folder" className="icon" aria-label="Папка" />
    </main>
  )
}
```

`width` и `height` в JSX необязательны: размер можно задать CSS-классом или через `wrapped`. Не добавляй Client Component boundary только ради иконки. Generated module формирует asset URL через статический `new URL('./sprite.svg', import.meta.url).href`; один механизм используется при SSR и в браузере.

Не импортируй из `generated/` и не перемещай SVG в `public`. Управляемые файлы (`generated/`, `index.ts`, `manifest.ts`, `.gitignore`) перегенерируются.

## SpriteViewer

Viewer интерактивен и импортируется из client-only entry. Создай отдельную Client Component страницу или дочерний компонент:

```tsx
'use client'

import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('@/ui/file-manager/svg-sprite/manifest'),
  () => import('@/ui/navigation/svg-sprite/manifest'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Пути `import()` должны быть строковыми литералами. Оставь production icon imports за пределами `@gromlab/svg-sprites/react`: package React entry предназначен только для Viewer и содержит `'use client'`.

## Проверка

Сначала генерация и типы:

```bash
npm run sprite:file-manager
npm run typecheck
```

Если менялись target или Next build/deployment pipeline либо диагностируется runtime, запусти production-сборку проекта, настроенную на выбранный сборщик:

```bash
npm run build
```

После обязательных генерации и typecheck проверь:

- `manifest.ts` содержит точный target `next@app/turbopack` либо `next@app/webpack`;
- server page компилируется без добавления `'use client'`;

При условной production/runtime-проверке проверь также:

- HTML содержит `href` на `.svg#id`, а URL asset доступен после `next start`;
- URL не использует `data:`, `file:` или `blob:`;
- SSR markup и hydrated page ссылаются на один asset;
- сложные SVG исследованы по [complex-svg.md](complex-svg.md); визуальный и a11y результат утверждай только при наличии соответствующих инструментов.

## Типовые ошибки

- `Next.js mode requires a router and bundler`: нельзя использовать `--mode next`; укажи полный mode.
- Сборка проходит на одном bundler, а runtime asset ломается на другом: перегенерируй тем target, которым реально выполняется build.
- Выбран Webpack, но build ушёл в Turbopack: используй Webpack-команду проекта и `next@app/webpack`.
- Viewer вызывает ошибку Server Component: файл с Viewer должен иметь `'use client'`; generated icon component этого не требует.
- `React config file not found`: команда получила путь к `app/`, `icons/` или конфигу вместо каталога спрайта.
- Две CI jobs генерируют разные target в одном checkout: раздели каталоги или обеспечь один согласованный target на job.
- Asset не найден под `basePath`/CDN: проверяй Next asset handling и deployment config, не подменяй generated URL вручную.
- Ошибка package subpath types: используй TypeScript 5+ и `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

Для вызова генератора из build script открой [programmatic-api.md](programmatic-api.md).
