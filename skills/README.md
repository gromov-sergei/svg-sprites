# AI skills

Исходники обязательного контекста английского и русского skills находятся в `skills/svg-sprites/src/{en,ru}/`. Канонические exact-mode guides находятся в `docs/{en,ru}/guides/` и копируются в соответствующий skill без изменения. Готовые переносимые артефакты генерируются в `skills/artifacts/`, игнорируются Git и упаковываются в ZIP во время release workflow.

Обе языковые версии имеют одинаковую структуру:

```text
src/<language>/
├── SKILL.md
├── core/
│   ├── 00-package-overview.md
│   ├── 10-mode-selection.md
│   ├── 20-project-inspection.md
│   ├── 30-react-next-setup.md
│   ├── 40-generated-contract.md
│   ├── 50-usage-and-colors.md
│   ├── 60-verification.md
│   └── 70-diagnostics.md
└── references/
    ├── programmatic-api.md
    └── complex-svg.md
```

`core/` содержит обязательные знания, раскрываемые прямо в итоговый `SKILL.md`. Локальный `references/` содержит только agent-specific материалы. Девять файлов из `docs/<language>/guides/` копируются в `references/guides/`; английский artifact получает только английские guides, русский только русские. Второй набор mode guides и каталог `references/upstream/` не создаются.

## Композиция Markdown

В любой собираемый документ можно включать фрагменты:

```md
<!-- include: ./core/10-mode-selection.md -->
```

Include раскрываются рекурсивно, путь считается относительно включающего файла. Циклы, отсутствующие файлы, выход за `skills/svg-sprites/`, frontmatter во фрагментах и нераскрытые include завершают сборку ошибкой. Заголовки не сдвигаются автоматически: entry содержит единственный `# H1`, inline-фрагменты начинаются с `##`.

## Локальная сборка

```bash
npm run build:skill
```

Команда собирает и валидирует обе языковые версии, затем записывает их в игнорируемый каталог `skills/artifacts/`. Сборщик проверяет точный список файлов, безопасные пути, symlink, Markdown fences, локальные ссылки и anchors, единственный H1, frontmatter, размер основного документа и отсутствие `TODO`.
