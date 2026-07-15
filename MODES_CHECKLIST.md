# Exact Mode Checklist

Mode отмечается поддержанным только после завершения полного вертикального среза:

- реализован независимый adapter в `src/modes/<mode-slug>/`;
- добавлен один integration-стенд для exact mode;
- production build стенда успешно рендерит иконку из внешнего SVG-спрайта;
- Viewer на стенде загружает тот же спрайт и проходит адресный E2E;
- добавлены быстрые старты на русском и английском языках;
- ссылки на быстрые старты добавлены в `README_RU.md` и `README.md`.

## Standalone

- [x] `standalone`
- [x] `standalone@vite`
- [x] `standalone@webpack`

## React

- [x] `react@vite`
- [x] `react@webpack`

## Next.js

- [x] `next@app/turbopack`
- [x] `next@app/webpack`
- [x] `next@pages/turbopack`
- [x] `next@pages/webpack`

## Vue

- [x] `vue@vite`
- [x] `vue@webpack`

## Nuxt

- [x] `nuxt@vite`
- [x] `nuxt@webpack`

## Svelte

- [x] `svelte@vite`
- [x] `svelte@webpack`
- [x] `sveltekit@vite`

## Angular

- [x] `angular@application`
- [x] `angular@webpack`

## Astro

- [x] `astro@vite`

## Solid

- [x] `solid@vite`
- [x] `solid@webpack`
- [x] `solid-start@vite`

## Preact

- [x] `preact@vite`
- [x] `preact@webpack`

## Qwik

- [x] `qwik@vite`

## Lit

- [x] `lit@vite`
- [x] `lit@webpack`

## Alpine.js

- [x] `alpine@vite`
- [x] `alpine@webpack`
