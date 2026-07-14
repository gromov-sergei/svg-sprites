# @gromlab/svg-sprites

[🇬🇧 English](README.md) | 🇷🇺 Русский

![npm](https://img.shields.io/npm/v/@gromlab/svg-sprites) ![license](https://img.shields.io/npm/l/@gromlab/svg-sprites)

`@gromlab/svg-sprites` — генератор SVG-спрайтов для современных веб-приложений. Он собирает выбранные SVG-иконки в один или несколько внешних кешируемых спрайтов и подготавливает их для использования в интерфейсе.

Для vanilla-приложений с Vite/Webpack пакет создаёт нативный типизированный Web Component, а для React и Next.js — React-компонент. SVG во всех случаях остаётся отдельным кешируемым asset.

## SVG-спрайт так же прост, как обычная SVG-иконка

Для всего спрайта генерируется один типизированный React-компонент. Выберите иконку через `icon`, а редактор покажет автокомплит всех доступных имён.

```tsx
<AppIcon icon="search" width={24} height={24} />
```

Компонент принимает привычные SVG-атрибуты: размеры, `color`, `className`, `style`, `aria-*` и обработчики событий. Если нужен внешний контейнер, добавьте `wrapped`.

```tsx
<AppIcon icon="search" wrapped className="iconWrapper" />
```

В приложении не приходится работать со спрайтом напрямую. Вы используете его так же, как обычную SVG-иконку, но получаете один компонент, автокомплит и TypeScript-проверку всех имён.

В `standalone@vite` и `standalone@webpack` тот же подход доступен без React:

```ts
import { defineAppIconElement } from './app-icons'

defineAppIconElement()
```

```html
<app-icon icon="search" style="font-size: 24px"></app-icon>
```

Bare `standalone` остаётся минимальным и генерирует только SVG asset и JSON manifest без JavaScript runtime.

## AI-friendly из коробки

`@gromlab/svg-sprites` сразу рассчитан на работу с AI-агентами. Подключите готовый skill и поручите агенту настройку, миграцию или диагностику без длинных инструкций и ручного изучения документации.

[🇷🇺 Скачать AI skill (на русском)](https://github.com/gromlab-ru/svg-sprites/releases/latest/download/svg-sprites-ru.zip)

[🇬🇧 Скачать AI skill (на английском)](https://github.com/gromlab-ru/svg-sprites/releases/latest/download/svg-sprites.zip)

## От SVG до компонента за четыре шага

Основной пример использует Next.js App Router и Turbopack.

### 1. Генерируйте без установки пакета

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites --help
```

`npx` временно скачивает CLI, не добавляет `@gromlab/svg-sprites` в
`package.json`, а generated production runtime не импортирует package.

### 2. Укажите нужные иконки

SVG могут оставаться в существующей структуре проекта:

```text
src/
├── assets/icons/
│   ├── search.svg
│   └── settings.svg
├── features/profile/
│   └── user.svg
└── ui/app-icons/
    └── svg-sprite.config.ts
```

Создайте конфигурацию спрайта:

```ts
// src/ui/app-icons/svg-sprite.config.ts
export default {
  mode: 'next@app/turbopack',
  name: 'app',
  input: [
    '../../assets/icons/search.svg',
    '../../assets/icons/settings.svg',
    '../../features/profile/user.svg',
  ],
}
```

### 3. Добавьте генерацию

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/app-icons/svg-sprite.config.ts",
    "predev": "npm run sprites",
    "prebuild": "npm run sprites"
  }
}
```

Первый запуск:

```bash
npm run sprites
```

Пакет создаст `AppIcon`, TypeScript-типы и отдельный SVG-спрайт.

### 4. Используйте как обычную иконку

```tsx
import { AppIcon } from '@/ui/app-icons'

export default function SearchButton() {
  return (
    <button type="button">
      <AppIcon icon="search" width={20} height={20} />
      Найти
    </button>
  )
}
```

Это Server Component. Для иконки не нужны provider, `'use client'` или ручная сборка URL.

## Типизированный React-компонент с автокомплитом

Каждый спрайт получает собственный готовый компонент. Свойство `icon` формируется из реальных имён SVG, поэтому редактор показывает точный список доступных иконок, а TypeScript сразу обнаруживает опечатки.

```tsx
<AppIcon icon="search" />  // доступная иконка
<AppIcon icon="serach" />  // ошибка TypeScript
```

После добавления новой SVG-иконки и повторной генерации её имя автоматически появляется в типах и автокомплите. Не нужно вручную поддерживать компоненты, union-типы или реестр имён.

## Next.js App Router и SSR из коробки

Generated-компоненты работают в Server Components, SSR и SSG без `'use client'`.

Подключение иконки не переносит страницу на клиент, не требует provider и не создаёт дополнительную границу гидратации.

Один и тот же компонент можно использовать в `page.tsx`, `layout.tsx`, серверных и клиентских компонентах.

## Множественные спрайты вместо одного глобального

Проект не ограничен одним набором иконок. Создавайте независимые спрайты для общих элементов, отдельных страниц и крупных UI-модулей.

```tsx
<AppIcon icon="search" />
<AnalyticsIcon icon="chart" />
<EditorIcon icon="bold" />
```

Каждый набор получает собственный типизированный компонент и SVG asset, поэтому разделы приложения не несут иконки, которые им не нужны.

## Каждая иконка хранится в одном экземпляре

В библиотеке исходников каждая SVG-иконка хранится в одном экземпляре и может входить в любое количество спрайтов. Общие иконки не приходится копировать между страницами и модулями: они обновляются для всех наборов из одного места.

```text
search.svg ─┬─→ AppIcon
            ├─→ AnalyticsIcon
            └─→ EditorIcon
```

Спрайты разделяются ради производительности, но библиотека исходных иконок остаётся единой.

## Браузерное кеширование

При стандартной конфигурации Vite, Webpack или Next.js каждый спрайт выпускается отдельным версионированным SVG-файлом.

Пока набор иконок не меняется, браузер может использовать сохранённую копию независимо от обновлений JavaScript приложения.

Изменение React-компонентов не требует повторно загружать геометрию всех иконок.

## JavaScript без SVG-балласта

Контуры иконок остаются во внешних SVG assets и не увеличивают chunks приложения.

```text
React-код   → JavaScript chunks
SVG-иконки  → отдельные SVG assets
```

JavaScript отвечает за интерфейс и поведение, а графика загружается и кешируется отдельно.

## Трансформации SVG из коробки

Во время генерации пакет автоматически подготавливает исходные SVG для интерфейса:

- удаляет фиксированные `width` и `height`;
- сохраняет существующий `viewBox`;
- преобразует `fill` и `stroke` в CSS-переменные;
- добавляет плавные transitions непосредственно в цветные элементы иконки.

Каждую трансформацию можно настроить или отключить независимо.

## Каждый цвет под контролем CSS

При генерации цвета `fill` и `stroke` автоматически преобразуются в CSS-переменные `--icon-color-N`.

Монохромная иконка наследует `currentColor`:

```tsx
<AppIcon icon="search" color="rebeccapurple" />
```

В многоцветной иконке каждый цвет можно менять отдельно:

```tsx
<AppIcon
  icon="user"
  style={{
    '--icon-color-1': '#2563eb',
    '--icon-color-2': '#dbeafe',
  }}
/>
```

Темы, состояния и hover-эффекты создаются без редактирования SVG и дополнительных копий иконки.

## SpriteViewer: все спрайты на одной debug-странице

`SpriteViewer` рендерит все standalone, React и Next.js спрайты проекта в одном месте. Один Web Component отвечает за визуал, а React использует тонкий bridge к нему.

Для каждой иконки видны созданные CSS-переменные и их fallback-цвета. Значения можно менять прямо в Viewer и сразу наблюдать результат.

Здесь же доступны готовые примеры подключения через:

- React;
- `<svg><use>`;
- `<img>`;
- CSS.

![SpriteViewer](https://raw.githubusercontent.com/gromlab-ru/svg-sprites/master/preview-image.png)

Viewer подключается только к внутренней debug-странице и не становится частью generated-компонентов иконок.

Bare standalone подключает Viewer через browser script и HTML element; bundler modes используют npm entry, а React и Next.js импортируют `SpriteViewer` из `@gromlab/svg-sprites/react`.

## Standalone, React и Next.js

Пакет генерирует низкоуровневые standalone-спрайты для static HTML, Vite и Webpack 5, а также типизированные React-компоненты для React и Next.js.

## Чистый Git

Bundler и framework modes создают локальный `.gitignore`, который исключает generated-файлы и не позволяет им засорять историю, pull requests и код проекта. Bare `standalone` оставляет политику репозитория приложению.

В bundler и framework modes в репозитории остаются исходные SVG, конфигурация и правило `.gitignore`, а локально и в CI спрайты, компоненты и типы заново создаются через `prebuild`.

## В production только иконки

Генерация полностью работает через `npx`, без добавления package в проект. Устанавливайте его как development dependency, только если нужны Viewer, типы конфига или программный API.

Production-компоненты используют только локальный generated-код, стили и внешний SVG-файл. Compiler и CLI не попадают в клиентское приложение, а `SpriteViewer` подключается отдельно только там, где нужна debug-страница.

## Документация

README знакомит с возможностями проекта и показывает основной сценарий использования. Для настройки выберите руководство под свой стек.

### Быстрый старт

- [Bare standalone](docs/ru/guides/standalone.md)
- [Standalone + Vite](docs/ru/guides/standalone-vite.md)
- [Standalone + Webpack 5](docs/ru/guides/standalone-webpack.md)
- [React + Vite](docs/ru/guides/react-vite.md)
- [React + Webpack 5](docs/ru/guides/react-webpack.md)
- [Next.js App Router + Turbopack](docs/ru/guides/next-app-turbopack.md)
- [Next.js App Router + Webpack](docs/ru/guides/next-app-webpack.md)
- [Next.js Pages Router + Turbopack](docs/ru/guides/next-pages-turbopack.md)
- [Next.js Pages Router + Webpack](docs/ru/guides/next-pages-webpack.md)

### Технические материалы

- [Индекс документации](docs/ru/README.md)
- [Технический справочник](docs/ru/reference/technical.md)
- [Программный API](docs/ru/reference/programmatic-api.md)

## Лицензия

MIT
