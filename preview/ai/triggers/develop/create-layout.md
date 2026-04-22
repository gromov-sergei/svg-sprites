---
title: Создать layout
---

# Создать layout

Инструкция по созданию layout.tsx в Next.js App Router.

## Прочитай перед началом

- applied/page-level.md — правила layout.tsx: провайдеры, metadata, вёрстка
- applied/project-structure.md — структура `src/app/`

## Шаги

1. Определи уровень layout:
   - Корневой (`src/app/layout.tsx`) — провайдеры, глобальные стили, metadata
   - Вложенный (`src/app/{route}/layout.tsx`) — layout для группы страниц

2. Создай `layout.tsx` в нужном маршруте.

3. Вёрстку layout-обёрток вынеси в слой `layouts/` (→ applied/page-level.md).

4. Layout содержит только провайдеры и вызов layout-компонента — не вёрстку.

## Смежные триггеры

- triggers/develop/create-page.md — страницы внутри layout
- triggers/develop/create-component.md — layout-компонент в `layouts/`

## Проверь себя

- [ ] Вёрстка вынесена в layout-компонент в `layouts/`
- [ ] layout.tsx содержит только провайдеры и вызов layout-компонента
