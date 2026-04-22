---
title: Создать страницу
---

# Создать страницу

Инструкция по добавлению нового route в Next.js проект. Страница — это экран + page.tsx.

## Прочитай перед началом

- applied/page-level.md — правила файлов роутинга: page.tsx, layout.tsx, metadata
- applied/project-structure.md — где располагаются файлы

## Шаги

1. Сгенерируй экран из шаблона `screen` в `src/screens/` (→ triggers/develop/generate-module.md).

2. Заполни экран логикой и стилями.

3. Создай `page.tsx` в нужном маршруте `src/app/`.
   - page.tsx тонкий: только `metadata` и рендер экрана
   - Никакой логики, стилей и хуков в page.tsx

4. Добавь `metadata` с `title` (→ applied/page-level.md).

## Смежные триггеры

- triggers/develop/generate-module.md — генерация экрана из шаблона
- triggers/develop/create-layout.md — если нужен новый layout для маршрута
- triggers/develop/create-component.md — компоненты внутри экрана

## Проверь себя

- [ ] Экран создан из шаблона `screen` в `src/screens/`
- [ ] page.tsx тонкий — только metadata и рендер экрана
- [ ] metadata содержит title и description
