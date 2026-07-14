## Контракт generated-каталога

После генерации React/Next-каталог имеет следующий вид:

```text
svg-sprite/
├── icons/                              # пользовательские исходники
├── svg-sprite.config.ts                # рекомендуемое имя конфига
├── index.ts                            # необязательный пользовательский barrel
├── .gitignore                          # управляет генератор
└── .svg-sprite/
    ├── index.js
    ├── index.d.ts
    ├── icon-data.js
    ├── icon-data.d.ts
    ├── sprite.svg
    ├── svg-sprite.manifest.js
    ├── svg-sprite.manifest.d.ts
    └── react/
        ├── react-component.js
        ├── react-component.d.ts
        └── react-component.module.css
```

Standalone не создаёт `react/`. Bare `standalone` генерирует `sprite.svg` и
`svg-sprite.manifest.json`; `standalone@vite`/`standalone@webpack` дополнительно
генерируют `index.*`, `icon-data.*` и resolved manifest. Их `index.*` также
содержит нативный generated Web Component; bare `standalone` не получает JS runtime,
не создаёт и не изменяет `.gitignore`.

Редактируй исходные SVG, config-файл и пользовательский `index.ts`. Не изменяй вручную содержимое `.svg-sprite`: повторная генерация его перезапишет. Во всех modes, кроме bare `standalone`, generated `.gitignore` также находится под управлением генератора. Для импорта из корня sprite-модуля создай barrel:

```ts
export * from './.svg-sprite'
```

Генератор полностью владеет каталогом `.svg-sprite` и заменяет его при каждом запуске. Никогда не помещай туда пользовательские файлы. Генератор также владеет `.gitignore`, когда выбранный mode его создаёт; bare `standalone` оставляет существующий `.gitignore` без изменений. Generated-пути не должны содержать symlink.

Внутренний `index.js` экспортирует компонент из `react/react-component.js` и readonly-массив имён; соседний `index.d.ts` добавляет props/style-типы и union имени. Manifest declarations bundler modes объявляют типы локально и не импортируют generator package. Manifest содержит mode, URL, target, список и метаданные иконок для debug-инструментов и не импортируется production-компонентом.

Спрайт остаётся отдельным asset с content hash; SVG path-данные не встраиваются в JavaScript:

- `react@vite` генерирует статический импорт `sprite.svg?no-inline`, запрещающий Vite inline;
- `standalone@vite` использует тот же Vite asset-механизм и экспортирует href helper и нативный Web Component без React;
- `standalone@webpack` использует Webpack Asset Modules и экспортирует такой же mode-local Web Component без React;
- React Webpack 5 и все Next modes генерируют `new URL('./sprite.svg', import.meta.url).href`, который должен обработать Asset Modules соответствующего сборщика;
- кастомный Webpack SVG loader не должен перехватывать generated `sprite.svg`;
- в Next mode generated-компонент не содержит `'use client'` и работает в Server Components, SSR и SSG; не добавляй клиентскую границу только ради иконки;
- команда сборки Next и mode key должны совпадать: Turbopack с `.../turbopack`, Webpack с `.../webpack`.

Для bundler modes не перемещай generated sprite в `public` и не переписывай URL вручную. Для bare `standalone` не перемещай managed original: приложение может явно копировать его в deploy output и само отвечает за публичный URL и очистку копии. При смене mode перегенерируй спрайт с новым полным key.
