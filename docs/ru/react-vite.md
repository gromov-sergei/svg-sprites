# React + Vite

[← Главная](../../README_RU.md)

Краткая инструкция по установке и использованию SVG-спрайтов в проекте на React и Vite.

В результате вы получите типизированный React-компонент и отдельный кешируемый SVG asset.

## 1. Установите пакет

```bash
npm install --save-dev @gromlab/svg-sprites
```

## 2. Создайте папку спрайта

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
├── index.ts
└── svg-sprite.config.ts
```

Поместите исходные SVG-файлы в `icons/`.

## 3. Добавьте конфиг

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
})
```

Корневой barrel принадлежит приложению и явно возвращает generated API:

```ts
// src/ui/file-manager/svg-sprite/index.ts
export * from './.svg-sprite'
```

По умолчанию SVG берутся из `./icons`. Общие иконки из других папок можно добавить через `inputFiles`: папка и список объединяются в один спрайт.

Полный список опций находится в разделе [«Единая конфигурация»](reference.md#единая-конфигурация).

## 4. Добавьте генерацию в package.json

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
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

Имя `file-manager` преобразуется в `FileManagerIcon`:

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
<FileManagerIcon icon="check" />   // допустимо
<FileManagerIcon icon="unknown" /> // ошибка TypeScript
```

Типы, способы отображения и управление цветами описаны в [техническом справочнике](reference.md#react-компонент-и-typescript).

Vite выпустит спрайт отдельным файлом вида `assets/sprite-<hash>.svg`. SVG path-данные не попадут в JavaScript.

## 6. Добавьте debug-страницу

После подключения иконок можно вывести все React-спрайты через `SpriteViewer`:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type { SpriteManifestModule } from '@gromlab/svg-sprites/react'

const sources = import.meta.glob<SpriteManifestModule>(
  '/src/**/svg-sprite/.svg-sprite/svg-sprite.manifest.js',
)

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} title="Иконки проекта" />
)
```

Vite автоматически найдёт generated manifest каждого React-спрайта. Шаблон `import.meta.glob` должен быть строковым литералом, а генерация должна выполниться до запуска Vite.

Размещайте Viewer только на debug-маршруте или во внутреннем инструменте.

## Если что-то не работает

- Нет `.svg-sprite/index.js`: запустите `npm run sprite:file-manager`.
- Viewer не видит спрайт: проверьте glob-путь к `.svg-sprite/svg-sprite.manifest.js`.
- Ошибка `Refusing to overwrite a user file`: в generated-пути находится пользовательский файл.
- Иконка не меняет цвет: используйте `color` или `--icon-color-N`.
