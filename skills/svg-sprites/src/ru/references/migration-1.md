# Миграция с legacy API 0.1.x на latest: операционный reference

## Когда открывать

Открывай этот документ только при установленной или ранее использовавшейся версии `0.1.x`, старых вызовах `svg-sprites` без `--mode`, `defineConfig`, `generate`, `loadConfig`, поле `sprites[].mode`, `publicPath` или общем компоненте `<SvgSprite>`. Не выполняй миграцию как побочный рефакторинг.

## Инвентаризация до правок

Сначала зафиксируй текущий контракт проекта:

```bash
npm ls @gromlab/svg-sprites
```

Перед обновлением config и scripts установи актуальный пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Найди и прочитай:

- `svg-sprites.config.ts` и `svg-sprite.config.ts`;
- scripts, вызывающие `svg-sprites`;
- импорты `defineConfig`, `generate`, `loadConfig`, `SvgSprite`;
- ссылки на `publicPath`, `.sprite.svg`, старый generated-компонент и preview;
- правила `.gitignore`, SVG loaders и CI generation steps.

До изменений реши один из двух путей. Не смешивай их в одном CLI-вызове.

## Путь A: сохранить централизованный legacy pipeline

Выбирай его, если приложение зависит от общего `public/sprites`, `symbol`, статических URL или `preview.html`.

Маппинг API:

| Legacy API 0.1.x | Latest API |
|---|---|
| `defineConfig` | `defineLegacyConfig` |
| `sprites[].mode` | `sprites[].format` |
| `generate` | `generateLegacy` |
| `loadConfig` | `loadLegacyConfig` |
| CLI без mode | `svg-sprites --mode legacy <config-dir>` в package script |

```ts
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

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode legacy ."
  }
}
```

Запусти его командой `npm run sprites`.

`publicPath` и генерация старого общего React-компонента удалены. Если приложение использовало этот компонент, legacy сохранит SVG asset, но React wrapper придётся заменить отдельно. Полный legacy workflow находится в [legacy.md](legacy.md).

## Путь B: перейти на локальные React/Next modules

Выбирай его, если нужны типизированные компоненты, hashed assets сборщика, Server Components или разбиение большого набора.

Для каждого нужного спрайта создай каталог проекта с локальным `svg-sprite.config.ts` и, при использовании папки, `icons/`. Каталог не обязан быть module/feature-каталогом; каждый config описывает один из потенциально многих спрайтов:

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'global',
  inputFolder: './icons',
  inputFiles: ['../../../shared/icons/check.svg'],
})
```

Для Next.js используй `defineNextSpriteConfig(...)`. Затем выбери ровно один mode:

| Среда | Mode |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next App + Turbopack | `next@app/turbopack` |
| Next App + Webpack 5 | `next@app/webpack` |
| Next Pages + Turbopack | `next@pages/turbopack` |
| Next Pages + Webpack 5 | `next@pages/webpack` |

Пример:

```json
{
  "scripts": {
    "sprite:global": "svg-sprites --mode react@vite src/ui/global/svg-sprite",
    "sprites": "npm run sprite:global"
  }
}
```

Запусти его командой `npm run sprite:global`.

Замени старый generic component:

```tsx
// Было
<SvgSprite icon="check" />

// Стало при name: 'global'
<GlobalIcon icon="check" />
```

Новый модуль сам создаёт локальный `.gitignore`, `index.ts`, `manifest.ts` и `generated/`. SVG публикует bundler; не сохраняй старый `publicPath` и не копируй sprite в `public`.

Выбери детальную процедуру: [react-vite.md](react-vite.md), [react-webpack.md](react-webpack.md), [next-app.md](next-app.md) или [next-pages.md](next-pages.md).

## Изменения программного API

Пакет теперь только ESM:

```ts
import { compileSpriteContent, generateLegacy } from '@gromlab/svg-sprites'
```

Не используй `require()`. `compileSpriteContent(...)` теперь возвращает `Promise<Uint8Array>`, а не Node-specific `Buffer` declaration:

```ts
const bytes = await compileSpriteContent(folder)
await fs.promises.writeFile('sprite.svg', bytes)
```

Если старый код вызывал `generate`, замени его на `generateLegacy`; для local modules используй `generateReactSprite` или `generateNextSprite`. Точные сигнатуры см. в [programmatic-api.md](programmatic-api.md).

## Безопасный порядок миграции

1. Зафиксируй список текущих icon names, formats, public URLs и цветовых ожиданий.
2. При миграции импортов обнови dependency до latest и config API, но не удаляй старые artifacts до успешной новой генерации.
3. Добавь явный mode и каталог во все local/CI scripts.
4. Сгенерируй новый output.
5. Замени imports и JSX usages; проверь TypeScript union icon names.
6. Если менялись target/pipeline или диагностируется runtime, проверь asset URLs и SSR/SSG; визуальный результат оценивай только доступными для этого инструментами.
7. Только после этого удали подтверждённые старые generated-файлы и устаревшие ignore/loader rules.

Не удаляй целиком каталог, в котором могут находиться исходные SVG или пользовательские файлы. Актуальный writer отказывается перезаписывать файлы без generated marker; не обходи эту защиту.

## Проверка после миграции

Минимум для npm-проекта:

```bash
npm run sprites
npm run typecheck
```

Используй реальные имена scripts проекта. Генерация и typecheck — быстрые обязательные проверки. Production build, браузер и Network добавляй, только если миграция меняет target/pipeline или диагностируется runtime. Проверь:

- ни один script не вызывает CLI без `--mode` и path;
- config helper и CLI mode относятся к одному pipeline;
- local manifest содержит ожидаемый target, а legacy output содержит ожидаемый format;
- старые `publicPath`, `sprites[].mode` и imports удалённого API отсутствуют;
- generated-файлы создаются до typecheck/build в чистом checkout;
- каждый старый icon name доступен либо намеренно переименован;
- цвета и сложные SVG исследованы по [complex-svg.md](complex-svg.md), без утверждений о визуальной или a11y корректности при отсутствии инструментов;
- `SpriteViewer` заменил отдельный preview только для React/Next; legacy по-прежнему может использовать `preview.html`.

## Типовые ошибки

- `Missing required argument: --mode`: старый script не обновлён.
- `React mode requires a target` или `Next.js mode requires a router and bundler`: указан сокращённый mode вместо полного ключа.
- Deprecated `mode`: в legacy entry осталось `sprites[].mode`.
- `icons was renamed to inputFolder`: старое поле перенесено в local React/Next config без переименования.
- `require() of ES Module`: build script не переведён на ESM/import.
- Иконки исчезли: local `inputFolder` сканируется нерекурсивно либо shared files не добавлены через `inputFiles`.
- Runtime ищет старый `/sprites/...`: JSX/CSS usage не переведён на generated component или новый asset URL.
- Один sprite генерируется разными targets: CI/local scripts не согласованы; оставь один target, соответствующий реальному bundler.
