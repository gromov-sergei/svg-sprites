## Выбор режима

Выбери ровно один поддерживаемый mode key:

| Проект | Mode key |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |
| Старый общий конфиг | `legacy` |

Не используй неполные `react`, `next@app`, `next@pages`, будущий `standalone` или mode другого сборщика. Установи пакет как development dependency и добавь локальный CLI в package script. CLI всегда требует mode и ровно один путь к каталогу конфигурации:

```json
{
  "scripts": {
    "sprite:<name>": "svg-sprites --mode <mode-key> <sprite-directory>"
  }
}
```

Не передавай несколько путей, glob или путь к самому файлу конфигурации. Для нескольких современных спрайтов создай отдельную команду для каждого каталога.

Определяй legacy по контракту, а не по количеству спрайтов:

- `svg-sprites.config.ts` в переданном корне с верхнеуровневыми `output` и непустым массивом `sprites` является legacy-конфигурацией даже при одном элементе;
- каждый legacy-элемент использует `name`, `input` и необязательный `format: 'stack' | 'symbol'`; поле `mode` устарело;
- локальный `svg-sprite.config.ts` в каталоге одного спрайта с `name`, `description`, `inputFolder`, `inputFiles`, `transform` и `generatedNotice` относится к React/Next API даже если таких спрайтов в приложении много.

Не мигрируй legacy-конфигурацию без явного запроса. Не смешивай `defineLegacyConfig` и поля `output`/`sprites` с `defineReactSpriteConfig` или `defineNextSpriteConfig`.
