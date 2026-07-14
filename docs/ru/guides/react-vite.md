# React-компонент для Vite

Это автономный quick start для exact mode key `react@vite`: генератор создаёт типизированный `IconsIcon`, а Vite публикует отдельный SVG asset.

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
  mode: 'react@vite',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Вместо `.ts` можно использовать `.js` с `default export` или `.json`.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

В CI замените `latest` на точную версию, например `@gromlab/svg-sprites@1.1.5`. Exact Vite commands:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts",
    "dev": "npm run sprites && vite",
    "build": "npm run sprites && tsc --noEmit && vite build",
    "typecheck": "npm run sprites && tsc --noEmit"
  }
}
```

Не добавляйте `predev`, `prebuild` или `pretypecheck`, если соответствующие scripts уже явно запускают `npm run sprites`. Generated `.svg-sprite` не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Generated declarations self-contained: они описывают компонент и manifest без импорта `@gromlab/svg-sprites`.

Пользовательский barrel возвращает generated API:

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Production usage:

```tsx
import { IconsIcon, iconsIconNames } from './sprite'

export function SaveButton() {
  return (
    <button type="button">
      <IconsIcon
        icon="check"
        width={24}
        height={24}
        aria-hidden="true"
        style={{ '--icon-color-1': '#16a34a' }}
      />
      Сохранить
    </button>
  )
}

console.log(iconsIconNames)
```

Prop `icon` является union имён исходных файлов. Vite автоматически обрабатывает generated CSS Module и импорт `sprite.svg?no-inline`; query запрещает inline и заставляет Vite выпустить отдельный hashed SVG asset. Если TypeScript не знает Vite asset imports, добавьте `/// <reference types="vite/client" />` в `src/vite-env.d.ts`.

## 2. Дебаг и превью

Viewer необязателен и нужен только для debug/preview. Установите package отдельно:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Используйте React bridge со статическим массивом loaders:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Строковый путь в `import()` должен указывать на generated JS manifest. Держите страницу за debug-маршрутом; `SpriteViewer` не входит в production runtime `IconsIcon`.

## 3. Типизация конфига

Если package установлен локально, используйте helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'icons',
})
```

Также можно импортировать `SpriteConfig` только как type и написать объект `satisfies SpriteConfig`.

Без package добавьте локальный type прямо в config:

```ts
type LocalSpriteConfig = {
  mode: 'react@vite'
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
  mode: 'react@vite',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Локальный type проверяет только этот exact mode и не создаёт runtime-зависимость.
