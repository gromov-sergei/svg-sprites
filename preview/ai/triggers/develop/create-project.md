---
title: Создать проект
scope: applied
keywords: [создать проект, новый проект, tiged, шаблон проекта, init]
when: "Создание нового Next.js проекта из шаблона"
---

# Создать проект

Инструкция по созданию нового Next.js проекта из готового шаблона. Проект готов к разработке сразу после установки зависимостей.

## Прочитай перед началом

- basics/getting-started.md — знакомство со стеком и особенностями проекта
- applied/project-structure.md — структура папок и файлов

## Шаги

1. Создай проект из шаблона:

   ```bash
   npx tiged git@gromlab.ru:templates/nextjs.git my-app
   cd my-app
   npm install
   ```

2. Ознакомься со структурой проекта (→ applied/project-structure.md).

3. Настрой VS Code (→ triggers/develop/setup-vscode.md).

## Что входит в шаблон

- Next.js + TypeScript (App Router)
- Mantine UI + PostCSS Modules
- Biome (линтинг и форматирование)
- Zustand, SWR
- Структура SLM Design (`screens/`, `layouts/`, `widgets/`, `business/`, `infrastructure/`, `ui/`, `shared/`)
- Шаблоны генерации (`.templates/`)
- Конфигурация VS Code (`.vscode/`)
- CSS-токены (цвета, отступы, радиусы, медиа)
- Open Graph метаданные

## Смежные триггеры

- triggers/develop/setup-vscode.md — настройка редактора
- triggers/develop/create-page.md — добавление первой страницы

## Проверь себя

- [ ] Проект создан из шаблона через `npx tiged`
- [ ] Зависимости установлены
- [ ] VS Code настроен (→ triggers/develop/setup-vscode.md)
