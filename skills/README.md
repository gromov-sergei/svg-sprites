# AI skills

Исходники скилов `svg-sprites` и `svg-sprites-ru` находятся в `skills/svg-sprites/`. Готовые самодостаточные артефакты записываются в `skills/artifacts/svg-sprites/` и `skills/artifacts/svg-sprites-ru/` и коммитятся в Git.

Основные `README.md`, `README_RU.md` и файлы `docs/{en,ru}/*.md` являются источником истины. Сборка копирует их в `references/` готового скила, поэтому вручную редактировать файлы внутри `skills/artifacts/` нельзя.

```bash
npm run build:skill
npm run check:skill
```

`build:skill` обновляет оба артефакта, а `check:skill` без изменения файлов проверяет их содержимое и синхронность с документацией. Версия без суффикса использует английский язык, версия с суффиксом `-ru` — русский.
