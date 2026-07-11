# Legacy mode: операционный reference

## Когда открывать

Открывай этот документ, если проект уже использует корневой `svg-sprites.config.ts`, централизованный output, несколько записей `sprites`, формат `symbol` или автономный `preview.html`. Не мигрируй такой проект на локальные React/Next modules без явного запроса; для плановой миграции открой [migration-1.md](migration-1.md).

## Что отличает legacy

- Один config управляет одним или несколькими спрайтами.
- Результаты записываются как `<name>.sprite.svg` в общий `output`.
- Поддерживаются `stack` и `symbol`; default format равен `stack`.
- `preview` по умолчанию включён и создаёт общий `preview.html`.
- Нет generated React-компонента, manifest-модуля, локального `.gitignore` и защиты managed writer.
- Legacy paths в загруженном конфиге разрешаются относительно каталога, переданного CLI.

## Конфиг и запуск

Установи пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

`svg-sprites.config.ts`:

```ts
import { defineLegacyConfig } from '@gromlab/svg-sprites'

export default defineLegacyConfig({
  output: 'public/sprites',
  preview: true,
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
    {
      name: 'logos',
      input: [
        'src/assets/logos/product.svg',
        'src/assets/shared/brand.svg',
      ],
      format: 'stack',
    },
  ],
})
```

В отличие от локальных React/Next config, каждый из которых описывает один из потенциально многих спрайтов, один legacy config сохраняет специфическую возможность управлять одним или несколькими entries спрайтов.

Script:

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode legacy .",
    "prebuild": "npm run sprites"
  }
}
```

Запусти `npm run sprites` из project root.

CLI path указывает каталог с `svg-sprites.config.ts`. Не передавай сам файл. Для config в другом каталоге передай этот каталог явно.

## Семантика input

- Строковый `input` означает каталог; читаются только SVG первого уровня, отсортированные по имени.
- Массив `input` означает точный список файлов; пустой массив является ошибкой.
- Расширение проверяется case-sensitive по окончанию `.svg`.
- Для массива проверяется существование каждого файла.
- В отличие от локального React config, legacy entry не объединяет одновременно папку и список. Для смешанного набора перечисли все файлы либо раздели entries.
- `name` используется непосредственно в имени output-файла; выбирай уникальные безопасные имена и не создавай две entries с одинаковым output name.

## Выбор формата и runtime

`symbol` нужен для существующей интеграции через `<svg><use>`:

```html
<svg width="24" height="24" aria-label="Готово">
  <use href="/sprites/icons.sprite.svg#check"></use>
</svg>
```

`stack` подходит для `<svg><use>`, `<img src="...svg#check">` и CSS URL. Для нового React/Next-кода не строй local component поверх legacy output автоматически: сначала выбери соответствующий современный mode.

CSS custom properties страницы управляют содержимым при `<svg><use>`, но не проникают в документ, загруженный как `<img>` или `background-image`. `symbol` не предназначен для `<img>`.

Имена с пробелами и небезопасными символами получают hash ID `icon-<16 hex>`. Поэтому не предполагай, что basename всегда равен fragment; проверь generated SVG или preview.

## Preview

При `preview: true` после всех SVG создаётся `output/preview.html`. Он содержит данные и inline-копии generated sprites. При диагностике runtime и наличии браузерных инструментов его можно открыть для проверки числа иконок, `viewBox` и `--icon-color-N`.

При `preview: false` новый preview не создаётся. Генератор не является очистителем произвольных файлов output: если старый `preview.html` больше не нужен, удаляй его только после подтверждения, что это прежний generated artifact.

## Проверка

```bash
npm run sprites
npm run typecheck
```

Генерация и typecheck проекта — быстрые обязательные проверки. Проверь для каждой entry:

- существует `public/sprites/<name>.sprite.svg`;
- в логе совпадают format и число иконок;
- ожидаемые `<symbol id="...">` либо вложенные `<svg id="...">` присутствуют;
- `preview.html` создан только при включённом preview;
- SVG со сложными `defs` проверены по [complex-svg.md](complex-svg.md).

Production build и браузер/Network запускай дополнительно только при изменении output/public pipeline или диагностике runtime. Тогда проверь URL реального приложения с учётом public base path и, если доступны визуальные инструменты, содержимое `preview.html`; не утверждай визуальный или a11y результат без такой проверки.

## Типовые ошибки

- `Config file not found`: CLI path не является каталогом с `svg-sprites.config.ts`.
- `Config file must have a default export`: экспортируй config через `defineLegacyConfig(...)`.
- Deprecated `mode`: поле `sprites[].mode` переименовано в `format`.
- `sprites must be a non-empty array`: legacy config не допускает пустую конфигурацию.
- `Input directory does not exist` или `SVG file does not exist`: помни, что paths считаются от каталога config при загрузке CLI.
- Вложенные SVG не найдены: directory scan не рекурсивен.
- Preview template not found при запуске из исходников пакета: собери package preview template; в опубликованном пакете он входит в distribution.
- Цвет не меняется в `<img>`: это изолированный SVG document; используй `<svg><use>` либо заранее заданные цвета.
- Старые output-файлы остались после удаления entry: legacy generator записывает текущие результаты, но не владеет очисткой всего output.

Программные варианты запуска и различия path resolution описаны в [programmatic-api.md](programmatic-api.md).
