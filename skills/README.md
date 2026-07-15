# AI skills

Исходники обязательного контекста английского и русского skills находятся в `skills/svg-sprites/src/{en,ru}/`. Готовые переносимые артефакты генерируются в `skills/artifacts/`, игнорируются Git и упаковываются в ZIP во время release workflow.

Русский skill хранит весь обязательный контекст в одном файле:

```text
src/ru/
├── SKILL.md
└── references/
    └── complex-svg.md
```

`src/ru/SKILL.md` содержит знания о пакете и рабочий процесс агента. Exact-mode настройка берётся из canonical guides, а не дублируется отдельными source-фрагментами.

Русский artifact дополнительно получает без изменений `README_RU.md` и содержательную пользовательскую документацию из `docs/ru/`. Локальный редакторский `guides/AGENTS.md`, а также навигационные `guides/README.md` и `reference/README.md` не копируются. Файлы находятся в `references/README_RU.md` и `references/docs/ru/`. Agent-specific `complex-svg.md` остаётся отдельным reference.

Английский source пока сохраняет составную структуру с `core/`, а artifact — английские exact-mode guides и локальные `programmatic-api.md`/`complex-svg.md`. Его перевод на единый `SKILL.md` и полную canonical-документацию выполняется отдельно.

## Композиция Markdown

Сборщик сохраняет поддержку Markdown includes для английского skill и будущих документов:

```md
<!-- include: ./core/10-mode-selection.md -->
```

Include раскрываются рекурсивно, путь считается относительно включающего файла. Циклы, отсутствующие файлы, выход за `skills/svg-sprites/`, frontmatter во фрагментах и нераскрытые include завершают сборку ошибкой. Заголовки не сдвигаются автоматически: entry содержит единственный `# H1`, inline-фрагменты начинаются с `##`.

## Локальная сборка

```bash
npm run build:skill
```

Команда собирает и валидирует обе языковые версии, затем записывает их в игнорируемый каталог `skills/artifacts/`. Сборщик проверяет точный список файлов, безопасные пути, symlink, Markdown fences, локальные ссылки и anchors, единственный H1, frontmatter, размер основного документа и отсутствие `TODO`.
