# React + Webpack 5

[← Главная](../../README_RU.md)

Краткая инструкция по установке и использованию SVG-спрайтов в проекте на React и Webpack 5.

В результате вы получите типизированный React-компонент и отдельный SVG asset через Webpack Asset Modules.

## 1. Установите пакет

```bash
npm install @gromlab/svg-sprites
```

## 2. Создайте папку спрайта

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Поместите исходные SVG-файлы в `icons/`.

## 3. Добавьте конфиг

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
})
```

По умолчанию SVG берутся из `./icons`. Общие иконки из других папок можно добавить через `inputFiles`: папка и список объединяются в один спрайт.

Полный список опций находится в разделе [Конфигурация → React](../../README_RU.md#react).

## 4. Добавьте генерацию в package.json

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode react@webpack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Generated-файлы исключаются из Git, поэтому генерация должна выполняться перед `dev`, `build` и `typecheck`.

Первый запуск:

```bash
npm run sprite:file-manager
```

## 5. Используйте компонент

```tsx
import { FileManagerIcon } from './svg-sprite'

export const OpenFolderButton = () => (
  <button type="button">
    <FileManagerIcon icon="folder" width={24} height={24} />
    Открыть
  </button>
)
```

Значение `icon` проверяется TypeScript по именам файлов:

```tsx
<FileManagerIcon icon="folder" />  // допустимо
<FileManagerIcon icon="missing" /> // ошибка TypeScript
```

Типы, способы отображения и управление цветами описаны в [основной документации](../../README_RU.md#способы-отображения).

Webpack обработает generated `new URL('./sprite.svg', import.meta.url)` через Asset Modules и выпустит отдельный SVG asset.

Если проект уже использует собственный SVG loader, убедитесь, что он не перехватывает generated `sprite.svg` вместо Asset Modules.

## 6. Добавьте debug-страницу

Webpack не поддерживает Vite API `import.meta.glob`, поэтому передайте статические loaders:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./ui/file-manager/svg-sprite/manifest'),
  () => import('./ui/navigation/svg-sprite/manifest'),
]

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} title="Иконки проекта" />
)
```

Пути в `import()` должны быть строковыми литералами. Webpack создаст chunks для манифестов и свяжет их с SVG assets.

Размещайте Viewer только на debug-маршруте или во внутреннем инструменте.

## Если что-то не работает

- Нет `index.ts`: запустите `npm run sprite:file-manager`.
- Viewer не загружает спрайт: проверьте путь в `import()` и наличие `manifest.ts`.
- Неверный URL asset: проверьте `output.publicPath`.
- SVG перехватывает другой loader: исключите generated sprite из несовместимого правила.

Для Next.js используйте отдельные mode key из руководств [App Router](next-app.md) и [Pages Router](next-pages.md).
