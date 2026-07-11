# Next.js Pages Router

[← Главная](../../README.md)

Поддерживаются два явных режима:

| Сборщик | Mode key | Версия Next.js |
|---|---|---|
| Turbopack | `next@pages/turbopack` | 16.2+ |
| Webpack 5 | `next@pages/webpack` | 12.2+ |

Для Next.js 12.2 требуется React 18.

## 1. Установите пакет

```bash
npm install @gromlab/svg-sprites
```

## 2. Создайте sprite-модуль

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
})
```

## 3. Добавьте генерацию

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@pages/webpack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager"
  }
}
```

Для Next.js 16.2 с Turbopack замените mode key на `next@pages/turbopack`.

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
  () => import('@/ui/file-manager/svg-sprite/manifest'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} />
}
```

## Проверка сборщика

```bash
# Turbopack
npx next build --turbopack

# Webpack 5
npx next build --webpack
```

Для Next 12–15 с Webpack используйте `npx next build` без флага.

Команда Next.js и mode key генератора должны указывать один и тот же сборщик.
