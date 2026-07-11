# Legacy mode

[← Главная](../../README_RU.md)

Краткая инструкция по генерации централизованных SVG-спрайтов форматов `symbol` и `stack` с optional HTML preview.

## 1. Установите пакет

```bash
npm install @gromlab/svg-sprites
```

## 2. Подготовьте иконки и конфиг

```text
project/
├── src/assets/icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprites.config.ts
```

```ts
// svg-sprites.config.ts
import { defineLegacyConfig } from '@gromlab/svg-sprites'

export default defineLegacyConfig({
  output: 'public/sprites',
  preview: true,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
  ],
})
```

## 3. Запустите генерацию

```bash
npx svg-sprites --mode legacy .
```

Результат:

```text
public/sprites/
├── icons.sprite.svg
└── preview.html
```

При `preview: false` HTML-файл не создаётся. Для формата `stack` укажите `format: 'stack'`.

## 4. Используйте symbol-спрайт

```html
<svg width="24" height="24" aria-label="Готово">
  <use href="/sprites/icons.sprite.svg#check"></use>
</svg>
```

## 5. Добавьте package script

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode legacy .",
    "prebuild": "npm run sprites"
  }
}
```

## Несколько спрайтов

Добавьте несколько записей в `sprites`:

```ts
sprites: [
  {
    name: 'icons',
    input: 'src/assets/icons',
    format: 'symbol',
  },
  {
    name: 'logos',
    input: 'src/assets/logos',
    format: 'stack',
  },
]
```

Все результаты и общий `preview.html` будут записаны в `output`.

## Если что-то не работает

- Не найден конфиг: убедитесь, что `svg-sprites.config.ts` находится в переданном корне.
- Нет иконок: проверьте `sprites[].input` и расширение `.svg`.
- Не нужен preview: установите `preview: false`.

Для программного запуска используйте [`generateLegacy`](programmatic-api.md#generatelegacy).
