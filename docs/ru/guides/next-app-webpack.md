# Next.js App Router с Webpack

Это автономный quick start для exact mode key `next@app/webpack`: generated `IconsIcon` совместим с Server Components и Webpack pipeline Next.js.

## 1. Генерация спрайта

Главное преимущество: генератор не нужно устанавливать и добавлять в `package.json`. `npx` временно скачивает CLI, а generated production runtime не импортирует `@gromlab/svg-sprites`.

```text
src/sprite/
├── icons/
│   ├── check.svg
│   └── warning.svg
├── index.ts
└── svg-sprite.config.ts
```

Минимальный plain config:

```ts
export default {
  mode: 'next@app/webpack',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Также поддерживаются `.js` с `default export` и `.json`.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

В CI замените `latest` точной версией, например `@gromlab/svg-sprites@1.1.5`. Exact Next commands для этого mode:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts",
    "dev": "npm run sprites && next dev --webpack",
    "build": "npm run sprites && next build --webpack",
    "start": "next start",
    "typecheck": "npm run sprites && tsc --noEmit"
  }
}
```

Не сочетайте явный `npm run sprites` с `predev` или `prebuild`. `.svg-sprite` generated и не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Generated declarations self-contained и не зависят от `@gromlab/svg-sprites`.

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Production usage в Server Component:

```tsx
// app/page.tsx
import { IconsIcon, iconsIconNames } from '../src/sprite'

export default function Page() {
  return (
    <main>
      <IconsIcon
        icon="check"
        width={24}
        height={24}
        aria-label="Готово"
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <span>{iconsIconNames.length} иконок</span>
    </main>
  )
}
```

Generated component не содержит `'use client'`. Next Webpack обрабатывает `new URL('../sprite.svg', import.meta.url).href` и публикует отдельный SVG asset; не переписывайте этот URL и не переносите sprite в `public` вручную.

## 2. Дебаг и превью

Viewer необязателен. Для debug/preview установите package:

```bash
npm install --save-dev @gromlab/svg-sprites
```

App Router требует отдельную Client Component boundary для Viewer:

```tsx
// app/icons-debug/sprite-viewer.tsx
'use client'

import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('../../src/sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

export function AppSpriteViewer() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

```tsx
// app/icons-debug/page.tsx
import { AppSpriteViewer } from './sprite-viewer'

export default function IconsDebugPage() {
  return <AppSpriteViewer />
}
```

Статический loader позволяет Webpack связать manifest и emitted SVG. Viewer не входит в production runtime `IconsIcon`.

## 3. Типизация конфига

При локально установленном package используйте helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@app/webpack',
  name: 'icons',
})
```

Другой package-вариант: type-only import `SpriteConfig` и `satisfies SpriteConfig`.

Без package вставьте локальный type прямо в config:

```ts
type LocalSpriteConfig = {
  mode: 'next@app/webpack'
  name?: string
  description?: string
  input?: string | string[]
  transform?: {
    removeSize?: boolean
    replaceColors?: boolean
    addTransition?: boolean
  }
  generatedNotice?: boolean
}

export default {
  mode: 'next@app/webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Локальный exact literal исключает случайную генерацию Turbopack или Pages Router output.
