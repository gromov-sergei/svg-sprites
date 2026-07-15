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
| `vue-vite` | `vue@vite` | Vue + Vite |
| `vue-webpack` | `vue@webpack` | Vue + Webpack 5 |
| `nuxt-vite` | `nuxt@vite` | Nuxt + Vite |
| `nuxt-webpack` | `nuxt@webpack` | Nuxt + Webpack |
| `svelte-vite` | `svelte@vite` | Svelte + Vite |
| `svelte-webpack` | `svelte@webpack` | Svelte + Webpack |
| `sveltekit` | `sveltekit@vite` | SvelteKit + Vite |
| `angular` | `angular@application` | Angular application builder |
| `angular-webpack` | `angular@webpack` | Angular + Webpack |
| `astro` | `astro@vite` | Astro + Vite |
| `solid-vite` | `solid@vite` | Solid + Vite |
| `solid-webpack` | `solid@webpack` | Solid + Webpack |
| `solid-start-vite` | `solid-start@vite` | SolidStart + Vite |
| `preact-vite` | `preact@vite` | Preact + Vite |
| `preact-webpack` | `preact@webpack` | Preact + Webpack |
| `qwik-vite` | `qwik@vite` | Qwik + Vite |
| `lit-vite` | `lit@vite` | Lit + Vite |
| `lit-webpack` | `lit@webpack` | Lit + Webpack |
| `alpine-vite` | `alpine@vite` | Alpine.js + Vite |
| `alpine-webpack` | `alpine@webpack` | Alpine.js + Webpack |
| `next-app-turbopack` | `next@app/turbopack` | App Router + Turbopack |
| `next-app-webpack` | `next@app/webpack` | App Router + Webpack |
| `next-pages-turbopack` | `next@pages/turbopack` | Pages Router + Turbopack |
| `next-pages-webpack` | `next@pages/webpack` | Pages Router + Webpack |

В verify-матрицу входят все exact modes из корневого `MODES_CHECKLIST.md`.

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
node scripts/run-workspaces.mjs build react-vite
npm run dev --workspace @svg-sprites-fixtures/react-vite --prefix integration
```

Первую команду запускайте из каталога `integration`.

Перед E2E production builds должны существовать. Тест запускает каждый server
последовательно, проверяет внешний `href`, HTTP status и Content-Type спрайта,
наличие symbol ID, отсутствие browser errors и зелёные пиксели отрисованной иконки.
Для каждого active mode тест также открывает единый Viewer, проверяет его Shadow DOM,
совпадение sprite URL, карточку `check`, dialog и mode-specific вкладки кода.

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
