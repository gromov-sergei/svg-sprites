# Integration playground

Постоянные минимальные consumer-приложения для проверки генерации, typecheck,
production build и отображения внешнего SVG-спрайта в настоящем Chromium.

## Матрица

| Fixture | Генератор | Runtime |
| --- | --- | --- |
| `standalone` | `standalone` | Static HTML + явный copy SVG |
| `standalone-vite` | `standalone@vite` | Vanilla TypeScript + Vite |
| `standalone-webpack` | `standalone@webpack` | Vanilla TypeScript + Webpack 5 |
| `react-vite` | `react@vite` | React + Vite |
| `react-webpack` | `react@webpack` | React + Webpack 5 |
| `next-app-turbopack` | `next@app/turbopack` | App Router + Turbopack |
| `next-app-webpack` | `next@app/webpack` | App Router + Webpack |
| `next-pages-turbopack` | `next@pages/turbopack` | Pages Router + Turbopack |
| `next-pages-webpack` | `next@pages/webpack` | Pages Router + Webpack |

В verify-матрицу входят только поддерживаемые exact modes. Fixtures остальных
frameworks сохранены как заготовки и будут подключаться после появления их adapters.

## Первый запуск

Из корня репозитория:

```bash
npm ci
npm run build:package
npm run integration:install
npm exec --prefix integration -- playwright install chromium
npm run integration:verify
```

`integration:verify` последовательно выполняет генерацию, typecheck, production build
активных fixtures и Playwright smoke-тесты.

## Отдельные этапы

```bash
npm run integration:generate
npm run integration:build
npm run integration:test
```

Для запуска команды только в одном fixture:

```bash
node integration/scripts/run-workspaces.mjs build react-vite
npm run dev --workspace @svg-sprites-fixtures/react-vite --prefix integration
```

Перед E2E production builds должны существовать. Тест запускает каждый server
последовательно, проверяет внешний `href`, HTTP status и Content-Type спрайта,
наличие symbol ID, отсутствие browser errors и зелёные пиксели отрисованной иконки.

Static fixture копирует managed SVG и JSON manifest в `dist/app-icons/` и использует
literal `<use href="/app-icons/sprite.svg#check">`.
Vite и Webpack fixtures получают URL только из generated facade и сверяют его с
resolved manifest.

## Структура

```text
integration/
├── apps/                 # реальные consumer package boundaries
├── fixtures/icons/       # общие исходные SVG
├── scripts/              # workspace runner и static production server
├── tests/                # Playwright runtime smoke
├── package.json          # отдельный npm workspace
└── package-lock.json     # зафиксированная framework matrix
```

Generated-файлы, framework build outputs и Playwright artifacts исключены через
`integration/.gitignore`.
