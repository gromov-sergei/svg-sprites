# Нативный icon Web Component с Vite

Это автономный quick start для exact mode key `standalone@vite`: generated facade регистрирует `<icons-icon>` и отдаёт SVG в asset pipeline Vite.

## 1. Генерация спрайта

Главное преимущество: генератор не нужно устанавливать и добавлять в `package.json`. `npx` временно скачивает CLI, а generated production runtime не импортирует `@gromlab/svg-sprites`.

Рекомендуемая структура держит конфиг и иконки рядом:

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
  mode: 'standalone@vite',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Конфиг также может быть `.js` с `default export` или `.json`.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

В CI замените `latest` на точную версию, например `@gromlab/svg-sprites@1.1.5`. Exact dev/build commands для Vite:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts",
    "dev": "npm run sprites && vite",
    "build": "npm run sprites && vite build",
    "typecheck": "npm run sprites && tsc --noEmit"
  }
}
```

Не добавляйте одновременно `predev`/`prebuild` и явный `npm run sprites` в этих scripts. `.svg-sprite` является generated-каталогом и не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Generated `.d.ts` self-contained и не импортируют `@gromlab/svg-sprites`.

Верните facade через пользовательский barrel:

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Production entry регистрирует native Web Component:

```ts
import { defineIconsIconElement, iconsIconNames } from './sprite'

defineIconsIconElement()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <icons-icon icon="check" role="img" aria-label="Готово"></icons-icon>
`

console.log(iconsIconNames)
```

Generated facade импортирует `sprite.svg?no-inline`: Vite автоматически выпускает отдельный hashed SVG asset и не превращает его в data URL. TypeScript-проекту при необходимости добавьте стандартные Vite types:

```ts
/// <reference types="vite/client" />
```

Размер по умолчанию равен `1em`, поэтому компонент удобно масштабировать через `font-size`. Цвет задаётся через `color` и generated custom properties:

```css
icons-icon {
  font-size: 24px;
  color: #334155;
  --icon-color-2: #f59e0b;
}
```

## 2. Дебаг и превью

Viewer необязателен и нужен только для debug/preview. Установите его отдельно:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Зарегистрируйте Viewer и передайте generated JS manifest через свойство `sources`:

```ts
import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'

document.querySelector<HTMLDivElement>('#app')!.insertAdjacentHTML(
  'beforeend',
  '<gromlab-sprite-viewer></gromlab-sprite-viewer>',
)

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.viewerTitle = 'Иконки проекта'
viewer.sources = [spriteManifest]
```

Расположите этот код только в debug entry или внутреннем маршруте. Viewer не входит в production runtime `<icons-icon>`.

## 3. Типизация конфига

При локально установленном package используйте helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'standalone@vite',
  name: 'icons',
})
```

Альтернатива с package: `import type { SpriteConfig }` и объект `satisfies SpriteConfig`.

Без package скопируйте локальный type прямо в config:

```ts
type LocalSpriteConfig = {
  mode: 'standalone@vite'
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
  mode: 'standalone@vite',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Локальный type ограничивает `mode` одним exact literal и ничего не загружает во время генерации.
