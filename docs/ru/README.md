# Документация

Для настройки выберите guide одного exact mode. Каждый guide является
самостоятельным документом и без изменений используется в AI skills.

## Гайды быстрого старта

| Проект | Exact mode | Guide |
|---|---|---|
| Static HTML или собственная публикация | `standalone` | [Bare standalone](guides/standalone.md) |
| Vanilla + Vite | `standalone@vite` | [Standalone + Vite](guides/standalone-vite.md) |
| Vanilla + Webpack 5 | `standalone@webpack` | [Standalone + Webpack](guides/standalone-webpack.md) |
| React + Vite | `react@vite` | [React + Vite](guides/react-vite.md) |
| React + Webpack 5 | `react@webpack` | [React + Webpack](guides/react-webpack.md) |
| Next.js App Router + Turbopack | `next@app/turbopack` | [App Router + Turbopack](guides/next-app-turbopack.md) |
| Next.js App Router + Webpack | `next@app/webpack` | [App Router + Webpack](guides/next-app-webpack.md) |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` | [Pages Router + Turbopack](guides/next-pages-turbopack.md) |
| Next.js Pages Router + Webpack | `next@pages/webpack` | [Pages Router + Webpack](guides/next-pages-webpack.md) |

Все guides используют один порядок:

1. Генерация спрайта через `npx` без добавления package в проект.
2. Необязательное подключение Viewer для дебага и превью.
3. Необязательная типизация конфига через package или локальный copy-paste type.

## Справочники

- [Технический справочник](reference/technical.md)
- [Программный API](reference/programmatic-api.md)
