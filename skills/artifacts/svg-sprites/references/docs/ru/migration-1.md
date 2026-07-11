# Миграция с 0.1.x на 1.0

[← Главная](../../README_RU.md)

Версия 1.0 разделяет локальную генерацию для React и Next.js и централизованный legacy-режим. Старый config нельзя смешивать с новым API в одном вызове CLI.

## CLI

CLI теперь всегда требует явный `--mode` и путь к каталогу конфигурации:

```text
svg-sprites
→ svg-sprites --mode <mode> <path>
```

Выберите mode по окружению:

| Окружение | Mode |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |
| Централизованная старая схема | `legacy` |

## React и Next.js

Вместо корневого `svg-sprites.config.ts` создайте локальный `svg-sprite.config.ts` рядом с набором иконок:

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'global',
  inputFolder: './icons',
})
```

Для обычного React используйте `defineReactSpriteConfig`. Папку и явный список общих SVG можно объединить через `inputFolder` и `inputFiles`.

Старые `publicPath` и `react` больше не нужны. Generated-модуль создаётся рядом с конфигом, сам добавляет `.gitignore`, а Vite, Webpack или Next.js выпускает SVG как отдельный asset с content hash.

Компонент `<SvgSprite icon="..." />` заменяется компонентом, имя которого выводится из `name`:

```tsx
<GlobalIcon icon="check" />
```

Для просмотра иконок добавьте `<SpriteViewer>` как debug-страницу приложения. Отдельный `preview.html` остаётся только в legacy-режиме.

## Legacy-режим

Если централизованную структуру нужно сохранить, переименуйте helper и поля формата:

```ts
import { defineLegacyConfig } from '@gromlab/svg-sprites'

export default defineLegacyConfig({
  output: 'public/sprites',
  preview: true,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'stack',
    },
  ],
})
```

- `defineConfig` заменён на `defineLegacyConfig`;
- `sprites[].mode` переименован в `sprites[].format`;
- `generate` заменён на `generateLegacy`;
- `loadConfig` заменён на `loadLegacyConfig`;
- `publicPath` и генерация старого общего React-компонента удалены.

Запуск:

```bash
svg-sprites --mode legacy .
```

## Программный API

Пакет распространяется только как ESM. Замените `require()` на `import`.

`compileSpriteContent` теперь возвращает `Promise<Uint8Array>`, чтобы публичные декларации не требовали установки `@types/node`. В Node.js фактический результат совместим с API, принимающими `Uint8Array`.

## После миграции

1. Удалите старые generated-файлы и правила, которые игнорировали целиком каталог с исходными иконками.
2. Добавьте явную команду генерации перед `dev`, `build` и `typecheck`.
3. Запустите генерацию и проверку типов.
4. Проверьте все иконки и цветовые переменные через `SpriteViewer` или legacy `preview.html`.
