# Next.js Pages Router с Webpack

Это автономный quick start для exact mode key `next@pages/webpack`: generated `IconsIcon` работает в Pages Router и публикует SVG через Webpack pipeline Next.js.

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
  mode: 'next@pages/webpack',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Поддерживаются `.ts`, `.js` с `default export` и `.json` configs.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

В CI замените `latest` на точную проверенную версию, например `@gromlab/svg-sprites@1.1.5`. Exact Next commands для Webpack:

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

Не дублируйте эти вызовы через `predev`, `prebuild` или `pretypecheck`. `.svg-sprite` generated и не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Generated declarations self-contained и не требуют `@gromlab/svg-sprites`.

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Production usage:

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

Компонент поддерживает SSR, SSG и клиентские переходы. Next Webpack преобразует generated `new URL('../sprite.svg', import.meta.url).href` во внешний hashed asset; не конструируйте URL спрайта вручную.

## 2. Дебаг и превью

Viewer необязателен. Устанавливайте package только для debug/preview:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Pages Router позволяет разместить Viewer непосредственно в page без отдельной App Router boundary:

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

Статический loader даёт Webpack точный manifest module и связанный SVG asset. Не импортируйте Viewer из production pages, если preview там не нужен; runtime `IconsIcon` от него независим.

## 3. Типизация конфига

После локальной установки package доступен helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@pages/webpack',
  name: 'icons',
})
```

Также можно применить `satisfies SpriteConfig` с type-only импортом `SpriteConfig`.

Без package вставьте локальный type прямо в config:

```ts
type LocalSpriteConfig = {
  mode: 'next@pages/webpack'
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
  mode: 'next@pages/webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Такой exact literal выявляет ошибочный выбор App Router или Turbopack ещё при проверке config.
