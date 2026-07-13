# Next.js Pages Router

[← Главная](../../README_RU.md)

Поддерживаются два явных режима:

| Сборщик | Mode key |
|---|---|
| Turbopack | `next@pages/turbopack` |
| Webpack 5 | `next@pages/webpack` |

## 1. Установите пакет

```bash
npm install --save-dev @gromlab/svg-sprites
```

## 2. Создайте sprite-модуль

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
├── index.ts
└── svg-sprite.config.ts
```

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@pages/webpack',
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
})
```

Корневой barrel принадлежит приложению:

```ts
// src/ui/file-manager/svg-sprite/index.ts
export * from './.svg-sprite'
```

## 3. Добавьте генерацию

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager"
  }
}
```

Для Turbopack замените mode key на `next@pages/turbopack`.

До импорта generated-модуля выполните первую генерацию:

```bash
npm run sprite:file-manager
```

## 4. Используйте на странице

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function FilesPage() {
  return <FileManagerIcon icon="folder" width={24} height={24} />
}

export function getServerSideProps() {
  return { props: {} }
}
```

Компонент одинаково работает при SSR, SSG и клиентских переходах. Next.js выпускает отдельный SVG asset с content hash.

## 5. Добавьте SpriteViewer

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('@/ui/file-manager/svg-sprite/.svg-sprite/svg-sprite.manifest.js'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} />
}
```

## Проверка сборщика

Запустите build script проекта, настроенный на выбранный сборщик:

```bash
npm run build
```

Build script и mode key генератора должны указывать один и тот же сборщик.
