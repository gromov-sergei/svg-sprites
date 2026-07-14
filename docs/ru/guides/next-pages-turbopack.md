# Next.js Pages Router с Turbopack

Это автономный quick start для exact mode key `next@pages/turbopack`: generated `IconsIcon` работает при SSR, SSG и клиентских переходах Pages Router.

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
  mode: 'next@pages/turbopack',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Конфиг также может быть `.js` с `default export` или `.json`.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

Для CI зафиксируйте точную версию, например `@gromlab/svg-sprites@1.1.5`. Exact commands должны сохранять Turbopack и для dev, и для production build:

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

Не добавляйте `predev`/`prebuild`, если scripts уже явно вызывают `npm run sprites`. Generated `.svg-sprite` не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Generated `.d.ts` self-contained и не импортируют generator package.

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Production usage на обычной page:

```tsx
// pages/index.tsx
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

Компонент одинаково работает с `getServerSideProps`, `getStaticProps` и client navigation. Turbopack разрешает generated `new URL('../sprite.svg', import.meta.url).href` в отдельный hashed asset.

## 2. Дебаг и превью

Viewer необязателен и нужен только для debug/preview:

```bash
npm install --save-dev @gromlab/svg-sprites
```

В Pages Router Viewer можно использовать прямо в page, без отдельной App Router Client Component boundary:

```tsx
// pages/icons-debug.tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('../src/sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

export default function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Оставляйте эту page только во внутреннем debug-разделе. Viewer не входит в production icon runtime `IconsIcon`.

## 3. Типизация конфига

Если package установлен локально, используйте helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@pages/turbopack',
  name: 'icons',
})
```

Альтернатива: type-only import `SpriteConfig` и объект `satisfies SpriteConfig`.

Без package добавьте copy-paste type в config:

```ts
type LocalSpriteConfig = {
  mode: 'next@pages/turbopack'
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
  mode: 'next@pages/turbopack',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Exact literal не позволяет незаметно смешать Pages Router с App Router или Webpack output.
