# Документация

Для настройки выберите guide одного exact mode. Каждый guide является
самостоятельным документом и без изменений используется в AI skills.

Общий формат JSON, JavaScript и TypeScript config-файлов описан в [руководстве по конфигурации](configuration.md).

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
2. Использование спрайта в приложении.
3. Необязательное подключение Viewer для дебага и превью.

## Справочники

- [Конфигурация](configuration.md)
- [Технический справочник](reference/technical.md)
- [Программный API](reference/programmatic-api.md)
