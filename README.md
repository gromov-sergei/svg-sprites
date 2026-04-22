# @gromlab/svg-sprites

Генерация SVG-спрайтов из папок с иконками. TypeScript-типизация, SVG-трансформации, React-компонент и HTML-превью из коробки.

## Установка

```bash
npm install @gromlab/svg-sprites
```

## Быстрый старт

Создайте файл `svg-sprites.config.ts` в корне проекта:

```ts
import { defineConfig } from '@gromlab/svg-sprites'

export default defineConfig({
  output: 'public',
  publicPath: '/public',
  react: 'src/shared/ui/svg-sprite',

  sprites: [
    { name: 'icons', input: 'src/assets/icons' },
    { name: 'logos', input: 'src/assets/logos' },
  ],
})
```

Запустите генерацию:

```bash
npx svg-sprites
```

Результат:

```
public/
  icons.sprite.svg
  logos.sprite.svg
  preview.html

src/shared/ui/svg-sprite/
  svg-sprite.tsx
  svg-sprite.module.css
```

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

Компонент полностью типизирован — автодополнение работает для имён иконок и спрайтов.

## Управление цветом

При сборке цвета иконок заменяются на CSS-переменные.

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

## Конфигурация

### `output` (обязательный)

Папка для сгенерированных спрайтов.

```ts
output: 'public/sprites'
```

### `sprites` (обязательный)

Массив спрайтов для генерации.

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
publicPath: '/img/sprites'
// → <use href="/img/sprites/icons.sprite.svg#check" />
```

### `react`

Путь для генерации React-компонента. Имена файлов берутся из названия папки.

```ts
react: 'src/shared/ui/svg-sprite'
// → svg-sprite.tsx + svg-sprite.module.css
```

Если не задан — компонент и типы не генерируются.

### `preview`

Генерация HTML-превью со всеми иконками. По умолчанию: `true`.

```ts
preview: false
```

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

## Сгенерированные типы

React-компонент включает TypeScript-типы для каждого спрайта:

```ts
import type {
  IconsIconName,  // 'check' | 'arrow-left' | ...
  LogosIconName,  // 'github' | 'twitter' | ...
  SpriteName,     // 'icons' | 'logos'
  SpriteMap,      // { icons: IconsIconName, logos: LogosIconName }
} from './shared/ui/svg-sprite'
```

## Способы рендера

| Способ | Управление цветом | Пример |
|--------|-------------------|--------|
| React / SVG `<use>` | CSS-переменные, `color` | `<SvgSprite icon="check" />` |
| CSS `mask-image` | `background-color` (монохром) | `.icon { mask: url(...); background-color: red; }` |
| `<img>` | нет | `<img src="icons.sprite.svg#check">` |

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
