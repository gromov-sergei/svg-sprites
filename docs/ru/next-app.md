# Next.js App Router

[← Главная](../../README.md)

Поддерживаются два явных режима:

| Сборщик | Mode key | Версия Next.js |
|---|---|---|
| Turbopack | `next@app/turbopack` | 16.2+ |
| Webpack 5 | `next@app/webpack` | 13.4+ |

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

Для Turbopack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@app/turbopack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager"
  }
}
```

Для Webpack замените mode key на `next@app/webpack`. В Next 13–15 Webpack используется обычной командой `next build`, в Next 16 — командой `next build --webpack`.

## 4. Используйте в Server Component

Generated-компонент не содержит `'use client'`, поэтому его можно импортировать непосредственно в `page.tsx` или `layout.tsx`:

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function Page() {
  return (
    <main>
      <FileManagerIcon icon="folder" width={24} height={24} />
    </main>
  )
}
```

Next.js выпустит отдельный SVG asset с content hash. Один generated-код используется при SSR и в браузере без расхождения URL.

## 5. Добавьте SpriteViewer

Viewer интерактивен, поэтому для него нужна отдельная Client Component граница:

```tsx
'use client'

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

Для Next 13–15 с Webpack используйте `npx next build` без флага.

Команда Next.js и mode key генератора должны указывать один и тот же сборщик.
