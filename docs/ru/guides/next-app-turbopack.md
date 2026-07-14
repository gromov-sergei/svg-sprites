# Next.js App Router с Turbopack

Это автономный quick start для exact mode key `next@app/turbopack`: generated `IconsIcon` совместим с Server Components и asset pipeline Turbopack.

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
  mode: 'next@app/turbopack',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Конфиг может быть `.ts`, `.js` с `default export` или `.json`.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

В CI зафиксируйте точную версию, например `@gromlab/svg-sprites@1.1.5`. Mode и команды Next должны указывать один bundler:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts",
    "dev": "npm run sprites && next dev --turbopack",
    "build": "npm run sprites && next build --turbopack",
    "start": "next start",
    "typecheck": "npm run sprites && tsc --noEmit"
  }
}
```

Не добавляйте одновременно `predev`/`prebuild` и явный `npm run sprites`. Generated `.svg-sprite` не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Его `.d.ts` self-contained и не импортируют generator package.

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Generated icon не содержит `'use client'`, поэтому его можно импортировать прямо в Server Component:

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

Turbopack обрабатывает generated `new URL('../sprite.svg', import.meta.url).href` и выпускает внешний hashed asset. Не добавляйте Client Component boundary только ради `IconsIcon`.

## 2. Дебаг и превью

Viewer необязателен и нужен только для debug/preview:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Viewer интерактивен, поэтому создайте для него отдельный Client Component:

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

Server page импортирует только эту boundary:

```tsx
// app/icons-debug/page.tsx
import { AppSpriteViewer } from './sprite-viewer'

export default function IconsDebugPage() {
  return <AppSpriteViewer />
}
```

Viewer не входит в production icon runtime и не нужен обычным страницам с `IconsIcon`.

## 3. Типизация конфига

После локальной установки package используйте helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@app/turbopack',
  name: 'icons',
})
```

Возможен и type-only import `SpriteConfig` с `satisfies SpriteConfig`.

Без package добавьте локальный type в config:

```ts
type LocalSpriteConfig = {
  mode: 'next@app/turbopack'
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
  mode: 'next@app/turbopack',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Exact literal защищает от смешивания App Router и других bundler contracts.
