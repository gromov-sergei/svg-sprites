# React-компонент для Webpack 5

Это автономный quick start для exact mode key `react@webpack`: generated `IconsIcon` использует Webpack 5 Asset Modules и CSS Modules.

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
  mode: 'react@webpack',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Поддерживаются `.ts`, `.js` с `default export` и `.json` configs.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

В CI замените `latest` на точную версию, например `@gromlab/svg-sprites@1.1.5`. Exact Webpack commands:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts",
    "dev": "npm run sprites && webpack serve --mode development",
    "build": "npm run sprites && webpack --mode production",
    "typecheck": "npm run sprites && tsc --noEmit"
  }
}
```

Не сочетайте эти явные вызовы с `predev`/`prebuild`: иначе генерация задублируется. `.svg-sprite` не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Generated `.d.ts` self-contained и не импортируют generator package.

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

Generated component получает URL через `new URL('../sprite.svg', import.meta.url).href`. Webpack 5 должен обработать SVG как Asset Module. Исключите generated `sprite.svg` из `@svgr/webpack`, inline/raw loaders и других общих SVG rules либо задайте для него `type: 'asset/resource'`.

Компонент импортирует `react-component.module.css`. Webpack config должен обрабатывать `*.module.css` через `css-loader` с CSS Modules и `style-loader` или `MiniCssExtractPlugin`. Для TypeScript при необходимости добавьте декларацию `declare module '*.module.css'`.

## 2. Дебаг и превью

Viewer необязателен. Устанавливайте package только для debug/preview:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Webpack не использует `import.meta.glob`; передайте статический loader:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Webpack создаст chunk manifest и разрешит его SVG через тот же Asset Modules pipeline. Viewer держите только в debug route; production `IconsIcon` от него не зависит.

## 3. Типизация конфига

С локально установленным package доступен helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@webpack',
  name: 'icons',
})
```

Эквивалентная проверка: type-only import `SpriteConfig` и `satisfies SpriteConfig`.

Без package используйте copy-paste type в config:

```ts
type LocalSpriteConfig = {
  mode: 'react@webpack'
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
  mode: 'react@webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Локальный literal не разрешит случайно выбрать Vite или Next mode.
