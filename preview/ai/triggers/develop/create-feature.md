---
title: Создать фичу
---

# Создать фичу

Инструкция по созданию бизнес-модуля на слое `business/`. Фича — самодостаточный блок с бизнес-логикой и UI.

## Прочитай перед началом

- basics/architecture.md — слои и зависимости
- applied/components.md — правила компонентов

## Шаги

1. Сгенерируй модуль из шаблона `business` (→ triggers/develop/generate-module.md).

2. Реализуй компонент фичи (→ applied/components.md).

3. Если нужен стор — создай в `stores/` (→ triggers/develop/create-store.md).

4. Если нужны хуки — создай в `hooks/` (→ triggers/develop/create-hook.md).

5. Настрой публичный API — экспорт через `index.ts`.

## Смежные триггеры

- triggers/develop/create-component.md — компонент внутри фичи
- triggers/develop/create-store.md — стор для фичи
- triggers/develop/create-hook.md — хук для фичи
- triggers/develop/generate-module.md — генерация из шаблона

## Проверь себя

- [ ] Модуль создан из шаблона `business`
- [ ] Публичный API настроен — экспорт через `index.ts`
- [ ] Cross-domain зависимости реализованы через фабрику (→ basics/architecture.md)
