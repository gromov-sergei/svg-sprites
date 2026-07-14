# Нативный icon Web Component с Webpack 5

Это автономный quick start для exact mode key `standalone@webpack`: generated facade предоставляет `<icons-icon>`, а Webpack 5 публикует SVG через Asset Modules.

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

Минимальный config рядом с `icons/`:

```ts
export default {
  mode: 'standalone@webpack',
  name: 'icons',
}
```

Если `input` не указан, SVG читаются из `./icons` относительно конфига. Поддерживаются также `.js` с `default export` и `.json`.

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/sprite/svg-sprite.config.ts
```

Для CI закрепите точную версию, например `@gromlab/svg-sprites@1.1.5`. Exact Webpack commands:

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

Не дублируйте запуск через `predev`/`prebuild`, если scripts уже явно вызывают `npm run sprites`. Generated `.svg-sprite` не коммитится. Generated локальный `.gitignore`, который исключает этот каталог, нужно добавить в Git один раз. Его declarations self-contained и не требуют `@gromlab/svg-sprites`.

```ts
// src/sprite/index.ts
export * from './.svg-sprite/index.js'
```

Production usage:

```ts
import { defineIconsIconElement, iconsIconNames } from './sprite'

defineIconsIconElement()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <icons-icon icon="check" role="img" aria-label="Готово"></icons-icon>
`

console.log(iconsIconNames)
```

Generated facade использует `new URL('./sprite.svg', import.meta.url).href`. Webpack 5 Asset Modules выпускают отдельный asset; его итоговый URL учитывает `output.publicPath` и `assetModuleFilename`.

Если проект использует `@svgr/webpack`, `svg-inline-loader`, `raw-loader` или общий SVG rule, исключите `src/sprite/.svg-sprite/sprite.svg` из этого правила. Generated SVG должен обрабатываться как `asset/resource`, а не как React-компонент или inline source.

Размер Web Component по умолчанию `1em`; управляйте им и цветами обычным CSS:

```css
icons-icon {
  font-size: 24px;
  color: #334155;
  --icon-color-2: #f59e0b;
}
```

## 2. Дебаг и превью

Viewer необязателен. Для debug/preview установите package как dev dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Подключите element entry и generated JS manifest:

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

Webpack свяжет manifest с тем же emitted SVG asset. Оставляйте Viewer только в debug entry: production `<icons-icon>` от него не зависит.

## 3. Типизация конфига

После локальной установки package можно использовать helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'standalone@webpack',
  name: 'icons',
})
```

Либо импортируйте только `SpriteConfig` как type и примените `satisfies SpriteConfig`.

Без package добавьте copy-paste type в сам config:

```ts
type LocalSpriteConfig = {
  mode: 'standalone@webpack'
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
  mode: 'standalone@webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```

Этот вариант сохраняет проверку exact mode без runtime import и без записи generator package в проект.
