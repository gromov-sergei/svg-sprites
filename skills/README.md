# AI skills

Исходники скила `svg-sprites` находятся в `skills/svg-sprites/`. Готовый самодостаточный артефакт записывается в `skills/artifacts/svg-sprites/` и коммитится в Git.

Основные `README.md` и `docs/ru/*.md` являются источником истины. Сборка копирует их в `references/` готового скила, поэтому вручную редактировать файлы внутри `skills/artifacts/` нельзя.

```bash
npm run build:skill
npm run check:skill
```

`build:skill` обновляет артефакт, а `check:skill` без изменения файлов проверяет его содержимое и синхронность с документацией.
