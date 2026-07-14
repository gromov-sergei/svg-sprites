# Архитектурные правила

## Изоляция modes

Каждый полный mode key является независимым adapter со своим generated-контрактом:

- `react@vite`;
- `react@webpack`;
- `next@app/turbopack`;
- `next@app/webpack`;
- `next@pages/turbopack`;
- `next@pages/webpack`;
- `standalone`;
- `standalone@vite`;
- `standalone@webpack`;
- будущие `vue@*` и другие modes.

Для каждого exact mode используется отдельный каталог `src/modes/<mode-slug>/`. Adapter самостоятельно определяет:

- compile options;
- список и имена generated-файлов;
- runtime JavaScript;
- TypeScript declarations;
- manifest source;
- CSS;
- способ получения asset URL;
- mode-specific result metadata.

Изменение output одного mode не должно менять output другого mode. Дублирование component, manifest, declaration и CSS codegen между adapters является сознательной ценой изоляции.

Запрещено:

- импортировать один `src/modes/<exact>/` из другого mode;
- создавать общий framework/component/manifest/CSS codegen для нескольких modes;
- создавать общий runtime asset URL generator для нескольких modes;
- ветвиться по generic target внутри adapter;
- писать generated-файлы непосредственно из adapter через `fs`;
- импортировать exact-mode adapters из core.

Единственное место, которое импортирует все adapters, — `src/mode-registry.ts`.

## Общий core

Общими могут быть только mode-neutral данные и инфраструктура:

- загрузка, merge и валидация config;
- scanner исходных SVG;
- shape IDs и проверка конфликтов;
- низкоуровневый SVG compiler и transformations;
- подготовка нейтрального compiled artifact;
- protocol `ModeAdapter`/`OutputPlan`;
- проверка output paths;
- atomic writer, symlink protection и ownership state;
- logger и базовые result types.

Core не генерирует JavaScript, declarations, manifest source, CSS или framework-specific exports. Изменение общего compiler может ожидаемо изменить SVG всех modes; изменение generated source должно быть локально одному adapter.

## Generated-контракт

Один config разрешается ровно в один mode и один output. Множественные modes не генерируются в один root; orchestration выполняется независимыми config/API/CLI вызовами.

Runtime генерируется как ESM JavaScript. Типизация добавляется отдельными `.d.ts`; TypeScript/TSX не используется как runtime output.

Core writer владеет корневым `.gitignore` и `.svg-sprite/state.json`. State не является manifest спрайта: он хранит owner mode, contract version и список управляемых файлов.

Sprite-level asset, icon data, manifest и facade лежат непосредственно в `.svg-sprite/`. Framework runtime группируется отдельно: React adapters используют `.svg-sprite/react/`, будущие framework adapters получают собственный framework-каталог.

Каждый adapter имеет собственный `contractVersion`. При изменении его generated-контракта повышается только версия этого adapter.

Adapter возвращает файлы в памяти. Только core writer проверяет paths и markers, обновляет output и записывает `state.json` последним.

## Зависимости

Допустимое направление импортов:

```text
public API / CLI
  -> generate
  -> mode-registry
  -> один exact-mode adapter
  -> core protocols and services
```

Обратные и горизонтальные зависимости запрещены:

```text
core -X-> modes
mode A -X-> mode B
mode A -X-> shared output codegen
```

`src/react/` с `SpriteViewer` является отдельным runtime пакета, а не mode adapter.

## Изменение mode

При работе с adapter:

1. Изменяйте только его каталог и mode-neutral protocol, если это действительно необходимо.
2. Не переносите output-логику в core ради устранения дублирования.
3. Не меняйте generated-контракты других adapters автоматически.
4. Повышайте `contractVersion` только изменённого adapter.
5. Проверяйте отсутствие cross-mode imports.
