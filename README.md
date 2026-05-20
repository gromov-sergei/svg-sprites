# @gromlab/svg-sprites

![npm](https://img.shields.io/npm/v/@gromlab/svg-sprites) ![license](https://img.shields.io/npm/l/@gromlab/svg-sprites)

Генерация SVG-спрайтов из папок с иконками. TypeScript-типизация, SVG-трансформации, React-компонент и HTML-превью из коробки.

![Preview](https://gromlab.ru/gromov/svg-sprites/media/branch/master/preview-image.png)

**Чем отличается от аналогов:**

- Генерирует готовый типизированный React-компонент — не нужно писать обёртку
- Автоматически заменяет цвета на CSS-переменные — для тем и hover-состояний
- Выдаёт HTML-превью всех иконок — удобно пересылать дизайнеру

## Требования

- Node.js 18+
- React 18+ (опционально, только если нужен генерируемый компонент)

## Установка

```bash
npm install @gromlab/svg-sprites
```

## Быстрый старт

Создайте файл `svg-sprites.config.ts` в корне проекта:

```ts
import { defineConfig } from '@gromlab/svg-sprites'

export default defineConfig({
  // Папка для сгенерированных SVG-спрайтов
  output: 'public/sprites',

  // URL-путь к спрайтам (для href в React-компоненте)
  publicPath: '/sprites',

  // Папка для React-компонента и типов
  react: 'src/shared/ui/svg-sprite',

  sprites: [
    { name: 'icons', input: 'src/assets/icons' },
    { name: 'logos', input: 'src/assets/logos' },
  ],
})
```

Запустите генерацию:

```bash
# или добавьте "sprite": "svg-sprites" в scripts вашего package.json
npx svg-sprites
```

В результате будут сгенерированы SVG-спрайты, типизированный React-компонент и HTML-превью.

Цвета иконок автоматически заменяются на CSS-переменные — см. раздел [Управление цветом](#управление-цветом).

## Использование компонента

```tsx
import { SvgSprite } from './shared/ui/svg-sprite'

// Иконка из первого спрайта (по умолчанию)
<SvgSprite icon="check" />

// Иконка из другого спрайта
<SvgSprite icon="github" sprite="logos" />

// Обёртка в <span> (удобно для inline-элементов)
<SvgSprite icon="arrow-left" wrapped />
```

Компонент полностью типизирован — автодополнение работает для имён иконок и спрайтов. Типы экспортируются из того же модуля:

```ts
import type {
  IconsIconName,  // 'check' | 'arrow-left' | ...
  LogosIconName,  // 'github' | 'twitter' | ...
  SpriteName,     // 'icons' | 'logos'
  SpriteMap,      // { icons: IconsIconName, logos: LogosIconName }
} from './shared/ui/svg-sprite'
```

## Управление цветом

При сборке цвета иконок заменяются на CSS-переменные. Это ключевая фича — иконки адаптируются к теме без дублирования SVG.

**Моно-иконка** (один цвет) — наследует `color` текста:

```css
.button { color: red; }
```

Или точечно через CSS-переменную:

```css
.button { --icon-color-1: #ff0000; }
```

**Мульти-иконка** (несколько цветов) — каждый цвет задаётся отдельной переменной:

```css
.card {
  --icon-color-1: #ff0000;
  --icon-color-2: #00ff00;
}
```

## Способы рендера

| Способ | Управление цветом | Пример |
|--------|-------------------|--------|
| React / SVG `<use>` | CSS-переменные, `color` | `<SvgSprite icon="check" />` |
| CSS `mask-image` | `background-color` (монохром) | `.icon { mask: url(...); background-color: red; }` |
| `<img>` | нет | `<img src="icons.sprite.svg#check">` |

## Конфигурация

### Основные опции

| Опция | Обязательная | Описание |
|-------|-------------|----------|
| `output` | да | Папка для сгенерированных SVG-спрайтов |
| `sprites` | да | Массив спрайтов для генерации |
| `publicPath` | нет | URL-путь к спрайтам (для `href` в React-компоненте) |
| `react` | нет | Путь для генерации React-компонента и типов |
| `preview` | нет | Генерация HTML-превью (по умолчанию: `true`) |

### `sprites`

```ts
sprites: [
  {
    name: 'icons',             // имя спрайта → icons.sprite.svg
    input: 'src/assets/icons', // папка с SVG-файлами
    mode: 'stack',             // 'stack' (по умолчанию) или 'symbol'
  },
  {
    name: 'flags',
    input: [                   // или массив конкретных файлов
      'src/components/button/arrow.svg',
      'src/components/modal/close.svg',
    ],
  },
]
```

### `publicPath`

Публичный URL-путь к спрайтам. Зашивается в React-компонент для формирования `href`.

```ts
publicPath: '/sprites'
// → <use href="/sprites/icons.sprite.svg#check" />
```

> **Примечание:** путь не должен включать имя папки `public` — она не входит в URL в Vite/Next.

### `react`

Имена файлов берутся из названия папки:

```ts
react: 'src/shared/ui/svg-sprite'
// → index.ts + svg-sprite.tsx + svg-sprite.module.css
```

Если не задан — компонент и типы не генерируются.

### `transform`

Настройки трансформации SVG. Все опции включены по умолчанию.

```ts
transform: {
  removeSize: true,     // удаляет width/height с <svg>
  replaceColors: true,  // заменяет цвета на CSS-переменные
  addTransition: true,  // добавляет transition к элементам с цветом
}
```

Например, для спрайта с фиксированными цветами:

```ts
transform: {
  replaceColors: false,
}
```

## Ограничения

- `mode: 'symbol'` — поддерживается, но превью и примеры кода оптимизированы под `stack`
- `replaceColors` может некорректно обработать иконки со сложными градиентами — используйте `transform: { replaceColors: false }` для таких случаев
- Генерируемый React-компонент предназначен для React 18+. Для Vue/Svelte используйте спрайты напрямую через SVG `<use>`

## Программный API

```ts
import { generate, defineConfig } from '@gromlab/svg-sprites'

const config = defineConfig({
  output: 'public',
  sprites: [{ name: 'icons', input: 'assets/icons' }],
})

const results = await generate(config)
```

## Лицензия

MIT
