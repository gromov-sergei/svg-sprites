# Технический справочник

[← Главная](../../README_RU.md)

Справочник по конфигурации, generated API и поведению `@gromlab/svg-sprites`. Пошаговую установку смотрите в руководстве для вашего стека:

- [Next.js App Router](next-app.md)
- [Next.js Pages Router](next-pages.md)
- [React + Vite](react-vite.md)
- [React + Webpack 5](react-webpack.md)
- [Нативный HTML и классические SVG-спрайты](legacy.md)

## Требования

- Node.js 18 или новее;
- пакет распространяется как ESM и подключается через `import`;
- React 18 или 19 требуется для generated-компонентов и `@gromlab/svg-sprites/react`;
- для типизации package exports используйте TypeScript 5+ с `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

Пакет устанавливается как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

## CLI и режимы генерации

CLI принимает один режим и путь к каталогу конфигурации:

```text
svg-sprites --mode <mode> <path>
```

| Среда | Mode |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |
| Классические `stack`- и `symbol`-спрайты | `legacy` |

Современные React- и Next.js-режимы используют локальный `svg-sprite.config.ts`. Legacy-режим использует отдельный `svg-sprites.config.ts` и описан в [собственном руководстве](legacy.md).

Mode должен соответствовать сборщику приложения. Генератор создаёт разный способ подключения SVG asset для Vite и сборщиков, совместимых с Webpack Asset Modules.

## Конфигурация React и Next.js

Каждый каталог с `svg-sprite.config.ts` описывает один независимый спрайт.

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'app',
  description: 'Общие иконки приложения',
  inputFolder: './local-icons',
  inputFiles: [
    '../../assets/icons/search.svg',
    '../../assets/icons/settings.svg',
  ],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

Для React используйте `defineReactSpriteConfig`. Контракт конфигурации одинаковый:

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'
```

| Опция | Тип | По умолчанию | Назначение |
|---|---|---|---|
| `name` | `string` | Выводится из каталога | Имя спрайта, компонента и публичных типов |
| `description` | `string` | Нет | Описание для типов и debug manifest |
| `inputFolder` | `string` | `./icons` | Каталог с SVG относительно конфига |
| `inputFiles` | `string[]` | `[]` | Пути к отдельным SVG относительно конфига |
| `transform` | `TransformOptions` | Все включены | Настройки подготовки SVG |
| `generatedNotice` | `boolean` | `true` | Полное или короткое предупреждение в generated-файлах |

### Имя спрайта

`name` записывается в kebab-case и должно начинаться с латинской буквы:

```text
app          → AppIcon
file-manager → FileManagerIcon
```

Если `name` не задано, генератор выводит его из каталога. Для каталога с именем `svg-sprite` или `svg-sprites` используется имя родительского каталога.

### Источники иконок

`inputFolder` и `inputFiles` объединяются в один набор. Это позволяет хранить локальные SVG рядом с модулем и добавлять общие иконки из других частей проекта без копирования.

Если `inputFiles` заполнен, а неявного каталога `./icons` нет, генерация работает только по списку файлов. Явно указанная отсутствующая `inputFolder` считается ошибкой.

Каталог сканируется только на первом уровне. Вложенные каталоги рекурсивно не обходятся. Для вложенной структуры перечислите точные пути через `inputFiles`.

Одинаковые абсолютные пути дедуплицируются. Разные SVG с одинаковым именем файла считаются конфликтом, потому что публичное имя иконки выводится из basename.

## Generated-модуль

После генерации каталог спрайта выглядит так:

```text
app-icons/
├── .gitignore
├── index.ts
├── manifest.ts
├── svg-sprite.config.ts
└── generated/
    ├── .svg-sprites.manifest.json
    ├── react-component.tsx
    ├── sprite.svg
    ├── styles.module.css
    └── types.ts
```

| Файл | Назначение |
|---|---|
| `index.ts` | Production exports компонента, props, стилей и имён иконок |
| `manifest.ts` | Debug metadata и URL asset для `SpriteViewer` |
| `generated/sprite.svg` | Собранный SVG-спрайт |
| `generated/react-component.tsx` | Типизированный React-компонент |
| `generated/styles.module.css` | Базовые стили и transitions |
| `generated/types.ts` | Runtime-список и union-тип имён |
| `generated/.svg-sprites.manifest.json` | Список файлов, которыми управляет генератор |

Генератор перезаписывает и удаляет только файлы со своим marker. Если в managed-пути находится пользовательский файл, генерация завершается ошибкой.

## React-компонент и TypeScript

Спрайт с `name: 'app'` экспортирует:

```ts
export { AppIcon, appIconNames }
export type { AppIconName, AppIconProps, AppIconStyle }
```

### Имена иконок

Имена SVG-файлов становятся допустимыми значениями `icon`:

```tsx
<AppIcon icon="search" />
<AppIcon icon="unknown" /> // ошибка TypeScript
```

Runtime-список содержит те же значения:

```ts
import { appIconNames } from '@/ui/app-icons'

// readonly ['search', 'settings', 'user']
```

Имена с пробелами и другими небезопасными для SVG ID символами остаются частью публичного API. Для внутреннего fragment ID генератор создаёт стабильный безопасный hash:

```text
folder open.svg → icon="folder open" → id="icon-<stable-hash>"
```

Для таких имён используйте generated-компонент или `id` из debug manifest, а не формируйте fragment ID вручную.

### SVG-атрибуты

По умолчанию компонент рендерит `<svg>` и принимает стандартные SVG-атрибуты:

```tsx
<AppIcon
  icon="search"
  width={24}
  height={24}
  color="rebeccapurple"
  className="searchIcon"
  aria-label="Поиск"
/>
```

Компонент не добавляет accessibility-семантику автоматически. Передавайте подходящие `aria-*`, `role` или подпись в зависимости от назначения иконки.

### Обёртка

`wrapped` рендерит `<span>` с внутренним SVG. Остальные props в этом режиме относятся к `<span>`:

```tsx
<AppIcon icon="search" wrapped className="iconWrapper" />
```

### Типизированные CSS-переменные

`AppIconStyle` расширяет `CSSProperties` и поддерживает свойства вида `--icon-color-N`:

```tsx
<AppIcon
  icon="user"
  style={{
    '--icon-color-1': '#2563eb',
    '--icon-color-2': '#dbeafe',
  }}
/>
```

## Множественные спрайты

Каждый каталог с конфигом создаёт независимый компонент, типы, manifest и SVG asset:

```text
app-icons       → AppIcon       → общие иконки
analytics-icons → AnalyticsIcon → иконки страницы аналитики
editor-icons    → EditorIcon    → иконки редактора
```

Один исходный SVG можно добавить через `inputFiles` в несколько конфигураций. Копировать файл в каталоги каждого спрайта не требуется.

Для нескольких спрайтов добавьте отдельную CLI-команду для каждого каталога или объедините команды в общем npm script.

## Форматы и способы отображения

Современные React- и Next.js-режимы создают формат `stack`. Legacy-режим поддерживает `stack` и `symbol`.

| Формат | `<svg><use>` | `<img>` | CSS background |
|---|---:|---:|---:|
| `stack` | Да | Да | Да |
| `symbol` | Да | Нет | Нет |

### Generated-компонент

Для React и Next.js используйте generated-компонент. Он знает внутренние ID, формирует URL и предоставляет TypeScript API:

```tsx
<AppIcon icon="search" width={24} height={24} />
```

### Вручную через `<svg><use>`

Способ получения `spriteUrl` зависит от сборщика.

Vite:

```ts
import spriteUrl from './generated/sprite.svg?no-inline'
```

Webpack 5, Turbopack и Next.js:

```ts
const spriteUrl = new URL('./generated/sprite.svg', import.meta.url).href
```

После получения URL используйте его в JSX:

```tsx
<svg width="24" height="24" aria-label="Поиск">
  <use href={`${spriteUrl}#search`} />
</svg>
```

Для имён, небезопасных как SVG ID, используйте внутренний `id` из manifest.

### Через `<img>`

```tsx
<img src={`${spriteUrl}#search`} width={24} height={24} alt="Поиск" />
```

SVG внутри `<img>` изолирован от CSS страницы. `color` и `--icon-color-N` на внешнем элементе не изменяют его внутренние цвета.

### Через CSS

```css
.icon {
  background: url('./generated/sprite.svg#search') center / contain no-repeat;
}
```

Для одноцветного силуэта можно использовать mask:

```css
.icon {
  background-color: currentColor;
  mask: url('./generated/sprite.svg#search') center / contain no-repeat;
}
```

Mask не сохраняет исходные цвета, gradients и различия между `fill` и `stroke`.

Путь в CSS разрешается относительно самого CSS-файла. В примерах CSS-файл находится рядом с `svg-sprite.config.ts`.

## Assets и кеширование

Generated-компонент передаёт SVG сборщику как отдельный asset:

- Vite использует статический импорт с `?no-inline`;
- Webpack 5, Turbopack и Next.js используют `new URL(..., import.meta.url)`;
- SVG path-данные не сериализуются в generated TSX.

При стандартном именовании assets сборщик добавляет content hash:

```text
/assets/sprite-<hash>.svg
```

Это позволяет кешировать SVG отдельно от JavaScript. Изменение React-кода не меняет содержимое спрайта, а изменение иконок создаёт новую версию asset.

HTTP cache headers, CDN и `Cache-Control` настраиваются приложением или платформой размещения. Для Webpack имя итогового файла зависит от `assetModuleFilename` проекта.

## Трансформации SVG

Все трансформации включены по умолчанию и настраиваются независимо:

| Опция | Что делает |
|---|---|
| `removeSize` | Удаляет `width` и `height` с корневого `<svg>`, сохраняя существующий `viewBox` |
| `replaceColors` | Заменяет найденные `fill` и `stroke` на `--icon-color-N` |
| `addTransition` | Добавляет transitions для `fill` и `stroke` в цветные элементы и generated styles |

Чтобы отключить отдельную операцию:

```ts
export default defineNextSpriteConfig({
  transform: {
    removeSize: false,
    replaceColors: false,
    addTransition: false,
  },
})
```

Исходные SVG не изменяются. Трансформации применяются только к содержимому generated-спрайта.

## Управление цветами

### Монохромные иконки

Если найден один цвет, fallback становится `currentColor`:

```svg
stroke="var(--icon-color-1, currentColor)"
```

Цвет задаётся через prop или CSS:

```tsx
<AppIcon icon="search" color="rebeccapurple" />
```

### Многоцветные иконки

Каждый уникальный цвет получает отдельную переменную с исходным fallback:

```svg
fill="var(--icon-color-1, #798198)"
fill="var(--icon-color-2, #ffffff)"
fill="var(--icon-color-3, #129d9d)"
```

Можно заменить только необходимые значения:

```css
.icon {
  --icon-color-1: #4b5563;
  --icon-color-3: #14b8a6;
}
```

### Ограничения

- `none`, `transparent`, `inherit`, `unset` и `initial` не заменяются;
- надёжнее всего обрабатываются цвета в атрибутах `fill`, `stroke` и inline `style`;
- CSS-классы и внешние stylesheets внутри SVG не являются основным сценарием трансформации;
- значения `url(#...)` могут быть заменены вместе с цветами, поэтому gradients и patterns требуют отдельного спрайта с `replaceColors: false`;
- masks, filters и сложные внутренние CSS-правила требуют визуальной проверки;
- CSS-переменные страницы доступны через `<svg><use>`, но не внутри `<img>` и CSS background.

Для сложной иконки можно отключить `replaceColors` в конфигурации отдельного спрайта.

## SpriteViewer

`SpriteViewer` подключается из отдельной клиентской точки входа:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
```

Он принимает готовые manifests, массив lazy loaders или record формата `import.meta.glob`.

Vite:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type { SpriteManifestModule } from '@gromlab/svg-sprites/react'

const sources = import.meta.glob<SpriteManifestModule>(
  '/src/**/svg-sprite/manifest.ts',
)

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} title="Иконки проекта" />
)
```

Webpack и Next.js:

```tsx
const sources = [
  () => import('@/ui/app-icons/manifest'),
  () => import('@/features/analytics/icons/manifest'),
]

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} />
)
```

Viewer показывает группы, поиск, `viewBox`, CSS-переменные, fallback-цвета и примеры React, SVG, IMG и CSS. Цветовые значения можно менять в интерфейсе и сразу проверять результат.

### Тема Viewer

По умолчанию `colorTheme="auto"` следует `prefers-color-scheme`. Можно передать `light` или `dark` явно:

```tsx
<SpriteViewer sources={sources} colorTheme="dark" />
```

Для синхронизации с темой приложения:

```tsx
<SpriteViewer
  sources={sources}
  colorTheme={appTheme}
  onColorThemeChange={setAppTheme}
/>
```

`@gromlab/svg-sprites/react` содержит `'use client'`. В Next.js App Router размещайте Viewer внутри отдельной Client Component boundary и используйте только на debug-маршруте или во внутреннем инструменте.

## Generated-файлы, Git и CI

Современный sprite-модуль создаёт локальный `.gitignore` для:

```text
/generated/
/index.ts
/manifest.ts
```

Локальный `.gitignore` следует один раз добавить в репозиторий. Он исключает остальные generated-файлы, поэтому генерацию нужно запускать перед командами, которые импортируют sprite-модуль:

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode next@app/turbopack src/ui/app-icons",
    "predev": "npm run sprites",
    "prebuild": "npm run sprites",
    "pretypecheck": "npm run sprites"
  }
}
```

CI должен устанавливать development dependencies и выполнять generation script до сборки или проверки типов.

Если в каталоге спрайта уже находится пользовательский `.gitignore`, `index.ts` или `manifest.ts`, генератор не перезапишет его. Переместите пользовательский файл или выберите отдельный каталог спрайта.

## Диагностика

- Нет `index.ts`: запустите generation script до импорта модуля.
- Не найдена конфигурация: проверьте путь CLI и имя `svg-sprite.config.ts`.
- Иконка отсутствует в типе: проверьте `inputFiles`, расширение `.svg` и уровень вложенности `inputFolder`.
- Конфликт имени: два разных SVG имеют одинаковый basename; переименуйте один файл.
- `Refusing to overwrite a user file`: в managed-пути находится файл без generated marker.
- Иконка не меняет цвет: используйте `<svg><use>` или generated-компонент и проверьте `replaceColors`.
- Webpack выдаёт неверный URL: проверьте Asset Modules, `output.publicPath` и SVG loaders.
- Viewer не видит спрайт: проверьте путь к `manifest.ts` и выполните генерацию до запуска приложения.
- Build и mode не совпадают: используйте target, соответствующий фактическому сборщику.

Для собственного orchestration и низкоуровневой компиляции смотрите [Программный API](programmatic-api.md).
