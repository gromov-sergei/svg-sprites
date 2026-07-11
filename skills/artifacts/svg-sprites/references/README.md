# @gromlab/svg-sprites

![npm](https://img.shields.io/npm/v/@gromlab/svg-sprites) ![license](https://img.shields.io/npm/l/@gromlab/svg-sprites)

CLI для генерации SVG-спрайтов и типизированных компонентов иконок для React и Next.js.

![Preview](https://gromlab.ru/gromov/svg-sprites/media/branch/master/preview-image.png)

## Навигация

- [Возможности](#возможности)
- [Таблица поддержки](#таблица-поддержки)
- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
  - [React + Vite](docs/ru/react-vite.md)
  - [React + Webpack 5](docs/ru/react-webpack.md)
  - [Next.js App Router](docs/ru/next-app.md)
  - [Next.js Pages Router](docs/ru/next-pages.md)
- [Конфигурация](#конфигурация)
  - [React](#react)
  - [Next.js](#nextjs)
- [Множественные спрайты](#множественные-спрайты)
- [TypeScript](#typescript)
- [Форматы спрайтов](#форматы-спрайтов)
- [Способы отображения](#способы-отображения)
- [Трансформации](#трансформации)
- [Управление цветом иконок](#управление-цветом-иконок)
- [Кеширование](#кеширование)
- [SpriteViewer](#spriteviewer)
- [Миграция с 0.1.x](docs/ru/migration-1.md)
- [Документация](#документация)

## Возможности

- **TypeScript-friendly** — типизированные React-компоненты, union-типы и runtime-списки доступных иконок.
- **Чистая генерация** — generated-файлы автоматически исключаются из Git, спрайт не нужно вручную размещать в `public`, а генератор обновляет только принадлежащие ему файлы.
- **Общие иконки без копирования** — SVG из локальной папки и `inputFiles` объединяются в один спрайт; один файл можно использовать в нескольких спрайтах.
- **Встроенное интерактивное превью** — `<SpriteViewer>` подключается как страница приложения и показывает переданные React- и Next.js-спрайты с поиском, настройкой цветов и примерами использования.
- **Настраиваемые трансформации SVG** — удаление `width` и `height` с сохранением `viewBox`, замена исходных цветов на CSS-переменные и transitions для `fill` и `stroke`.
- **Отдельный кешируемый SVG asset** — SVG path-данные не попадают в JavaScript chunks, а сборщик выпускает файл с content hash.
- **Множественные спрайты** — независимые React- и Next.js-модули со своими компонентами, типами и SVG assets.
- **Server-first Next.js** — generated-компоненты работают в Server Components, SSR и SSG без директивы `'use client'`.
- **Форматы под разные сценарии** — React и Next.js используют `stack`, legacy-режим также поддерживает `symbol` для существующих интеграций.

## Таблица поддержки

| Среда | Ключ мода API | Статус |
|---|---|---|
| React + Vite | `react@vite` | Готово |
| React + Webpack 5 | `react@webpack` | Готово |
| Next.js 16.2+ App Router + Turbopack | `next@app/turbopack` | Готово |
| Next.js 13.4+ App Router + Webpack 5 | `next@app/webpack` | Готово |
| Next.js 16.2+ Pages Router + Turbopack | `next@pages/turbopack` | Готово |
| Next.js 12.2+ Pages Router + Webpack 5 | `next@pages/webpack` | Готово |
| Vue | — | Скоро |
| Standalone | — | Скоро |

## Требования

- Node.js 18 или новее;
- пакет распространяется только как ESM и подключается через `import`;
- React 18 или 19 требуется только для generated-компонентов и точки входа `@gromlab/svg-sprites/react`;
- для типизации subpath exports используйте TypeScript 5+ с `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

## Быстрый старт

Для быстрого старта воспользуйтесь инструкцией для вашего стека:

- [React + Vite](docs/ru/react-vite.md)
- [React + Webpack 5](docs/ru/react-webpack.md)
- [Next.js App Router](docs/ru/next-app.md)
- [Next.js Pages Router](docs/ru/next-pages.md)

## Конфигурация

### React

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: [
    '../../shared/icons/check.svg',
  ],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

| Опция | Тип | По умолчанию | Назначение |
|---|---|---|---|
| `name` | `string` | Имя папки | Имя спрайта, компонента и публичных типов |
| `description` | `string` | Нет | Описание для типов и debug-манифеста |
| `inputFolder` | `string` | `./icons` | Папка с исходными SVG относительно конфига |
| `inputFiles` | `string[]` | `[]` | Дополнительные SVG-файлы относительно конфига |
| `transform` | `TransformOptions` | Все включены | [Настройки трансформации](#трансформации) исходных SVG |
| `generatedNotice` | `boolean` | `true` | Полное либо короткое предупреждение в generated-файлах |

`inputFolder` и `inputFiles` объединяются в один спрайт, поэтому один SVG-файл можно использовать в нескольких спрайтах без копирования. Если неявной папки `./icons` нет, но `inputFiles` заполнен, генерация продолжается только по списку. Явно указанная отсутствующая папка считается ошибкой. Одинаковые пути дедуплицируются, а разные файлы с одинаковым именем иконки считаются ошибкой.

`name` записывается в kebab-case и должно начинаться с латинской буквы. React и Next.js presets создают формат `stack`.

### Next.js

Next.js использует тот же `svg-sprite.config.ts` и набор опций. Для типизации можно использовать отдельный хелпер:

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
})
```

Роутер и сборщик выбираются через mode key, поэтому переключение между Turbopack и Webpack всегда явно отражено в команде генерации.

## Множественные спрайты

Приложение может содержать несколько независимых спрайтов с разной областью использования:

**Проблема:** один глобальный спрайт загружает иконки, которые текущему экрану не нужны.

**Решение:** общие иконки хранить глобально, а наборы страниц и крупных компонентов — в отдельных спрайтах, загружаемых вместе с ними.

```text
global            → GlobalIcon          → общие иконки приложения
analytics-page    → AnalyticsPageIcon   → иконки отдельной страницы
file-manager      → FileManagerIcon     → иконки крупного компонента
```

- **Глобальный спрайт** содержит небольшие общие иконки, используемые в разных частях приложения: навигацию, состояния и базовые действия.
- **Спрайт страницы** загружается вместе с конкретным разделом и не увеличивает общий спрайт иконками, которые больше нигде не нужны.
- **Спрайт крупного компонента** инкапсулирует собственный набор иконок сложного UI-модуля, например файлового менеджера или редактора.

Каждая группа получает:

- собственный SVG asset;
- собственный типизированный компонент;
- отдельный список имён иконок;
- отдельный debug-манифест;
- независимый cache lifecycle.


## TypeScript

Главная возможность TypeScript API — автодополнение имён иконок непосредственно в prop `icon`:

```tsx
<FileManagerIcon icon="folder" />
//                        ↑ редактор предлагает все иконки спрайта
```

Имена SVG-файлов становятся допустимыми значениями `icon`. Опечатка или неизвестное имя сразу становятся ошибкой TypeScript:

```tsx
<FileManagerIcon icon="unknown" /> // ошибка TypeScript
```

Для программного доступа generated-модуль экспортирует readonly-массив всех доступных иконок конкретного спрайта:

```ts
import { fileManagerIconNames } from './svg-sprite'

// readonly ['check', 'folder', ...]
```

Этот список можно использовать в собственных каталогах, select-компонентах, тестах и других runtime-сценариях. Из него также выводится union-тип `FileManagerIconName`.

Имена файлов с пробелами и другими небезопасными для SVG ID символами остаются частью публичного TypeScript API. Для внутреннего `<symbol id>` генератор создаёт стабильный hash ID.

```text
folder open.svg → icon="folder open" → id="icon-<stable-hash>"
```

Для таких имён используйте generated-компонент или `id` из debug-манифеста. Ручные примеры ниже с `#<имя>` подходят только для имён, которые уже являются безопасными SVG ID.

## Форматы спрайтов

`stack` — более современный формат, поэтому он используется по умолчанию. Иконки можно отображать через `<svg><use>`, `<img>` и CSS `background-image`.

`symbol` сохраняется для совместимости с существующими интеграциями и поддерживает отображение только через `<svg><use>`.

## Способы отображения

### React-компонент — рекомендуется

Generated-компонент предоставляет типизацию, автодополнение имён иконок и сам формирует URL SVG asset.

```tsx
<FileManagerIcon icon="check" width={24} height={24} />
```

Через `color` и `--icon-color-N` доступны одноцветные и многоцветные иконки.

### Самостоятельно через `<svg><use>`

Хороший низкоуровневый способ с полным управлением размерами и цветами. React-компонент под капотом использует именно его.

Способ получения `spriteUrl` зависит от сборщика.

**Vite:**

```tsx
import spriteUrl from './svg-sprite/generated/sprite.svg?no-inline'
```

**Webpack 5:**

```tsx
const spriteUrl = new URL(
  './svg-sprite/generated/sprite.svg',
  import.meta.url,
).href
```

**Next.js с Webpack 5 или Turbopack:**

```tsx
const spriteUrl = new URL(
  './svg-sprite/generated/sprite.svg',
  import.meta.url,
).href
```

После получения URL иконка отображается одинаково:

```tsx
<svg width={24} height={24}>
  <use href={`${spriteUrl}#check`} />
</svg>
```

Vite, Webpack 5 и Next.js сами заменяют исходный путь на итоговый URL asset с hash.

### Через `<img>` — менее эффективно

```tsx
<img src={`${spriteUrl}#check`} width={24} height={24} alt="Готово" />
```

SVG загружается как изолированное изображение: изменить его цвета через `color` или `--icon-color-N` нельзя.

### Через CSS `background-image` — менее эффективно

```css
.icon {
  background: url('./svg-sprite/generated/sprite.svg#check') center / contain no-repeat;
}
```

Как и `<img>`, этот способ не позволяет управлять внутренними цветами SVG. Путь указывается относительно CSS-файла, а Vite/Webpack заменяет его на итоговый URL с hash при сборке.

### Через CSS mask — менее эффективно

```css
.icon {
  background-color: currentColor;
  mask: url('./svg-sprite/generated/sprite.svg#check') center / contain no-repeat;
}
```

Mask оставляет только силуэт и окрашивает его одним цветом. Исходные цвета, gradients и различия между `fill` и `stroke` теряются.

## Трансформации

Все трансформации включены по умолчанию и настраиваются независимо через `transform`.

| Опция | По умолчанию | Что делает |
|---|---|---|
| `removeSize` | `true` | Удаляет `width` и `height` с корневого `<svg>`, сохраняя существующий `viewBox`. Размер иконки после этого задаётся снаружи. |
| `replaceColors` | `true` | Заменяет цвета `fill` и `stroke` на `--icon-color-N`. Для одноцветной иконки fallback становится `currentColor`, для многоцветной сохраняются исходные цвета. |
| `addTransition` | `true` | Добавляет `style="transition:fill 0.3s,stroke 0.3s;"` непосредственно цветным элементам SVG. Существующий `transition` не перезаписывается. |

Чтобы отключить преобразование, передайте для соответствующей опции `false`. Подробнее о результате `replaceColors` — в разделе [«Управление цветом иконок»](#управление-цветом-иконок).

## Управление цветом иконок

При включённой замене цветов генератор анализирует `fill` и `stroke` и преобразует их в CSS custom properties.

### Монохромные иконки

Если найден один цвет, fallback заменяется на `currentColor`:

```svg
stroke="var(--icon-color-1, currentColor)"
```

Цветом управляет CSS-свойство `color` внешнего `<svg>` или его родителя.

### Многоцветные иконки

Каждый уникальный цвет получает отдельную переменную с исходным fallback:

```svg
fill="var(--icon-color-1, #798198)"
fill="var(--icon-color-2, #ffffff)"
fill="var(--icon-color-3, #129d9d)"
```

Страница может заменить только необходимые цвета:

```css
.icon {
  --icon-color-1: #4b5563;
  --icon-color-3: #14b8a6;
}
```

### Ограничения цветов

- `none`, `transparent`, `inherit`, `unset` и `initial` не заменяются;
- цвета в атрибутах `fill`, `stroke` и inline `style` обрабатываются надёжнее всего;
- CSS-классы и внешние stylesheets внутри исходного SVG не являются основным сценарием трансформации;
- gradients, patterns, filters и значения `url(#...)` требуют отдельной проверки и могут быть несовместимы с автоматической заменой цветов;
- CSS-переменные страницы доступны при `<svg><use>`, но недоступны внутри `<img>` и `background-image`.

## Кеширование

Vite, Webpack и Next.js target выпускают спрайт отдельным asset с content hash:

```text
/assets/sprite-<hash>.svg
```

Это даёт следующие свойства:

- SVG кешируется независимо от JavaScript;
- изменение React-кода не меняет содержимое спрайта;
- изменение иконок создаёт новый hash asset;
- один файл используется всеми экземплярами generated-компонента;
- SVG path-данные отсутствуют в JavaScript chunks.

Vite target запрещает inline через `?no-inline`. Webpack 5 target использует Asset Modules через `new URL(..., import.meta.url)`.

## SpriteViewer

`SpriteViewer` — React-компонент для просмотра generated-спрайтов внутри debug-маршрута приложения.

Он использует отдельные манифесты и показывает:

- группы спрайтов;
- список и количество иконок;
- поиск и системную светлую/тёмную тему;
- модальное превью с `viewBox` и настройкой цветовых переменных;
- примеры React, SVG, IMG и CSS с копированием кода.

Production-компоненты не импортируют debug-манифесты. Способ подключения Viewer зависит от сборщика:

- [React + Vite: автоматический `import.meta.glob`](docs/ru/react-vite.md#6-добавьте-debug-страницу);
- [React + Webpack 5: статические `import()`](docs/ru/react-webpack.md#6-добавьте-debug-страницу);
- [Next.js App Router](docs/ru/next-app.md#5-добавьте-spriteviewer);
- [Next.js Pages Router](docs/ru/next-pages.md#5-добавьте-spriteviewer).

Viewer подключается из отдельной клиентской точки входа `@gromlab/svg-sprites/react` и не попадает в production-компоненты иконок.

### Тема Viewer

По умолчанию `colorTheme="auto"`: Viewer следует `prefers-color-scheme` и реагирует на смену системной темы. Тему приложения можно передать явно:

```tsx
<SpriteViewer sources={sources} colorTheme="dark" />
```

Допустимые значения `colorTheme`: `auto`, `light`, `dark`. При управлении темой извне встроенный переключатель скрывается. Чтобы оставить его и обновлять тему приложения через Viewer, передайте callback:

```tsx
<SpriteViewer
  sources={sources}
  colorTheme={appTheme}
  onColorThemeChange={setAppTheme}
/>
```

## Документация

- [React + Vite](docs/ru/react-vite.md)
- [React + Webpack 5](docs/ru/react-webpack.md)
- [Next.js App Router](docs/ru/next-app.md)
- [Next.js Pages Router](docs/ru/next-pages.md)
- [Legacy mode](docs/ru/legacy.md)
- [Миграция с 0.1.x](docs/ru/migration-1.md)
- [Программный API](docs/ru/programmatic-api.md)

## Лицензия

MIT
