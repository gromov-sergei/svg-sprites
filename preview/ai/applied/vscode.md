---
title: Настройка VS Code
scope: applied
keywords: [vscode, редактор, расширение, настройка, extension, .vscode]
when: "Настройка VS Code: расширения, settings.json, сниппеты"
---
# Настройка VS Code

Каждый проект содержит папку `.vscode/` с конфигурацией редактора. Это гарантирует, что все участники команды работают с одинаковыми настройками форматирования, линтинга и расширениями.

## Структура `.vscode/`

```text
.vscode/
├── extensions.json   # Рекомендуемые расширения
└── settings.json     # Настройки редактора для проекта
```

Оба файла коммитятся в репозиторий.

## Расширения

Файл `.vscode/extensions.json` определяет список расширений, которые VS Code предложит установить при открытии проекта.

```json
// .vscode/extensions.json
{
  "recommendations": [
    "biomejs.biome",
    "MyTemplateGenerator.mytemplategenerator",
    "csstools.postcss"
  ]
}
```

| Расширение | Назначение |
|---|---|
| [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) | Линтинг и форматирование кода. Заменяет ESLint и Prettier |
| Template File Generator \| gromlab ([Marketplace](https://marketplace.visualstudio.com/items?itemName=gromlab.vscode-templateFileGenerator), [Open VSX](https://open-vsx.org/extension/gromlab/vscode-templateFileGenerator)) | Генерация файлов и папок из шаблонов `.templates/` через контекстное меню |
| [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss) | Подсветка синтаксиса и автодополнение для PostCSS (`@custom-media`, `@nest` и др.) |

### Зачем это нужно

- Новый участник команды получает все нужные расширения одним кликом.
- Нет разночтений: все используют одинаковый форматтер и линтер.
- Расширения привязаны к проекту, а не к конкретному разработчику.

## Настройки редактора

Файл `.vscode/settings.json` переопределяет пользовательские настройки VS Code на уровне проекта.

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "files.associations": {
    "*.css": "postcss"
  }
}
```

### Разбор настроек

| Настройка | Значение | Что делает |
|---|---|---|
| `editor.defaultFormatter` | `biomejs.biome` | Biome используется как единственный форматтер для всех файлов |
| `editor.formatOnSave` | `true` | Код автоматически форматируется при каждом сохранении |
| `codeActionsOnSave.source.fixAll.biome` | `explicit` | Biome автоматически применяет безопасные исправления при сохранении |
| `codeActionsOnSave.source.organizeImports.biome` | `explicit` | Импорты сортируются и группируются автоматически при сохранении |
| `files.associations` | `"*.css": "postcss"` | Все CSS-файлы открываются с подсветкой PostCSS вместо стандартного CSS |

### Зачем это нужно

- **Единый стиль кода** -- форматирование происходит автоматически, невозможно закоммитить неформатированный код.
- **Автофикс при сохранении** -- распространённые ошибки линтинга исправляются без ручного вмешательства.
- **Сортировка импортов** -- импорты всегда в одном порядке, без конфликтов при мерже.
- **PostCSS-подсветка** -- кастомные at-правила (`@custom-media`, `@define-mixin`) подсвечиваются корректно, а не как ошибки.

## Что не должно быть в `.vscode/`

Не коммитятся файлы, специфичные для конкретного разработчика:

- **Не коммитить**: отладочные конфигурации с локальными путями, персональные сниппеты, настройки тем оформления.
- **Коммитить**: только `extensions.json` и `settings.json` с общими для команды настройками.
