## Контракт generated-каталога

После генерации выбранный каталог имеет следующий вид:

```text
svg-sprite/
├── icons/                              # пользовательские исходники
├── svg-sprite.config.ts                # пользовательский конфиг
├── .gitignore                          # управляет генератор
├── index.ts                            # публичная production-точка входа
├── manifest.ts                         # отдельная debug-точка входа
└── generated/
    ├── .svg-sprites.manifest.json      # реестр владения
    ├── react-component.tsx
    ├── sprite.svg
    ├── styles.module.css
    └── types.ts
```

Редактируй только исходные SVG и `svg-sprite.config.ts`. Не изменяй вручную `.gitignore`, `index.ts`, `manifest.ts` и содержимое `generated/`: повторная генерация их перезапишет. Импортируй production API из корневого `index.ts`, а не deep import из `generated/`.

Генератор владеет только перечисленными корневыми файлами и непосредственными файлами `generated/`. Реестр `.svg-sprites.manifest.json` позволяет удалить устаревший generated-файл, но writer откажется перезаписывать или удалять файл без generated-маркера. Не удаляй маркер, не обходи отказ и не подменяй generated-пути symlink: перенеси пользовательский файл или выбери другой каталог.

Публичная точка входа экспортирует компонент, props/style-типы, readonly-массив имён и union-тип имени. `manifest.ts` содержит URL, target, список и метаданные иконок для debug-инструментов и не импортируется production-компонентом.

Спрайт остаётся отдельным asset с content hash; SVG path-данные не встраиваются в JavaScript:

- `react@vite` генерирует статический импорт `sprite.svg?no-inline`, запрещающий Vite inline;
- React Webpack 5 и все Next modes генерируют `new URL('./sprite.svg', import.meta.url).href`, который должен обработать Asset Modules соответствующего сборщика;
- кастомный Webpack SVG loader не должен перехватывать generated `sprite.svg`;
- в Next mode generated-компонент не содержит `'use client'` и работает в Server Components, SSR и SSG; не добавляй клиентскую границу только ради иконки;
- команда сборки Next и mode key должны совпадать: Turbopack с `.../turbopack`, Webpack с `.../webpack`.

Не перемещай generated sprite в `public` и не переписывай URL вручную. При смене роутера или сборщика перегенерируй спрайт с новым полным mode key.
