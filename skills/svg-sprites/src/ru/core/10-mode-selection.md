## Выбор режима

Выбери ровно один поддерживаемый mode key:

| Проект | Mode key |
|---|---|
| Static HTML / собственная публикация | `standalone` |
| Standalone + Vite | `standalone@vite` |
| Standalone + Webpack 5 | `standalone@webpack` |
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |

Mode задаётся в config, CLI или программном API. Порядок применения: `defaults → config → CLI/API overrides`. После объединения mode обязателен.

CLI принимает ровно один путь. Путь к файлу `.ts`, `.js` или `.json` загружает именно этот конфиг независимо от имени. Путь к каталогу включает config-less генерацию, и настройки передаются флагами CLI.

```json
{
  "scripts": {
    "sprite:<name>": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites <path-to-config>",
    "sprite:<name>:cli": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites --mode <mode-key> <sprite-directory>"
  }
}
```

Генерация через `npx` не добавляет package в проект. В CI укажи точную версию вместо `latest`. Не используй неполные `react`, `next@app`, `next@pages`, `standalone@` или удалённый `legacy`. Bare `standalone` выбирай только когда приложение само публикует SVG; для Vite/Webpack используй соответствующий полный key. Для нескольких спрайтов создай отдельную команду для каждого config-файла или каталога.
