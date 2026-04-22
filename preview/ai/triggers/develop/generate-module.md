---
title: Сгенерировать модуль из шаблона
---

# Сгенерировать модуль из шаблона

Инструкция по генерации модуля из шаблонов `.templates/`. Ручное создание файловой структуры запрещено.

## Прочитай перед началом

- applied/templates-generation.md — шаблоны, синтаксис, инструменты генерации

## Шаги

1. Определи тип модуля и шаблон (→ applied/templates-generation.md):
   - Компонент → `component`
   - Бизнес-модуль → `business`
   - Виджет → `widget`
   - Layout → `layout`
   - Экран → `screen`
   - Стор → `store`

2. Запусти генерацию (→ applied/templates-generation.md).

3. Если подходящего шаблона нет — сначала создай шаблон, затем генерируй.

## Смежные триггеры

- triggers/develop/create-component.md — после генерации компонента
- triggers/develop/create-feature.md — после генерации бизнес-модуля
- triggers/develop/create-store.md — после генерации стора

## Проверь себя

- [ ] Модуль создан из шаблона, не вручную
- [ ] Выбран правильный шаблон для типа модуля (→ applied/templates-generation.md)
