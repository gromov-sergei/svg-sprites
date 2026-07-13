# React с Webpack 5: операционный reference

## Когда открывать

Открывай этот документ для React-приложения на Webpack 5, когда SVG должен проходить через Asset Modules. Если проект собирается Vite, используй [react-vite.md](react-vite.md). Для Next.js не выбирай `react@webpack`: router-specific targets описаны в [next-app.md](next-app.md) и [next-pages.md](next-pages.md).

## Диагностика окружения до изменений

1. Подтверди Webpack major version 5 в `package.json` или lockfile.
2. Изучи `module.rules` для `.svg`, `output.publicPath`, dev-server и существующие asset conventions.
3. Найди существующие `svg-sprite.config.ts` и scripts генерации.
4. Выбери каталог проекта конкретного спрайта. Он не обязан совпадать с module или feature-каталогом. Команда принимает каталог с config, не файл config и не папку иконок.

Минимальная структура:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

## Конфигурация и генерация

Установи пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@webpack',
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
})
```

Каждый config описывает один из потенциально многих независимых спрайтов приложения.

Пути считаются от `svg-sprite.config.ts`. Папка сканируется только на первом уровне. `inputFolder` и `inputFiles` объединяются; одинаковый путь дедуплицируется, но одинаковые basename у разных файлов вызывают конфликт ID. Неявный `./icons` можно не создавать, если заполнен `inputFiles`; явно заданная отсутствующая папка является ошибкой. `FileManagerIcon` ниже — только пример generated-имени из `name: 'file-manager'`.

Рекомендуемые lifecycle hooks:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Не затирай уже существующие pre-scripts: включи генерацию в их текущую цепочку. Для первой генерации запусти `npm run sprite:file-manager`. React preset всегда выпускает `stack`.

## Публичный компонент

```tsx
import { FileManagerIcon } from './svg-sprite'

export function OpenFolderButton() {
  return (
    <button type="button">
      <FileManagerIcon icon="folder" className="icon" aria-hidden />
      Открыть
    </button>
  )
}
```

`width` и `height` в JSX необязательны: размер можно задать CSS-классом или через `wrapped`. Пользовательский barrel также экспортирует `FileManagerIconProps`, `FileManagerIconStyle`, `FileManagerIconName` и `fileManagerIconNames`. Не редактируй `.svg-sprite` или созданный `.gitignore`.

## Нюанс Webpack target

Generated-компонент получает URL только через статическое выражение:

```ts
const spriteUrl = new URL('./sprite.svg', import.meta.url).href
```

Webpack 5 распознаёт его как Asset Module и заменяет на публичный URL отдельного SVG. Для корректной обработки:

- не оборачивай путь в переменную и не меняй generated expression;
- убедись, что Babel/TypeScript не преобразует `import.meta.url` до Webpack;
- не позволяй `@svgr/webpack`, `svg-inline-loader`, `raw-loader` или общему SVG rule перехватить `svg-sprite/.svg-sprite/sprite.svg`;
- при custom rule либо исключи generated sprite из component/raw loader, либо добавь отдельное правило `type: 'asset/resource'`;
- проверь `output.publicPath`, особенно при CDN, subpath deployment и dev-server.

Пример отдельного правила, если существующий loader перехватывает все SVG:

```js
{
  test: /svg-sprite[\\/]\.svg-sprite[\\/]sprite\.svg$/,
  type: 'asset/resource',
}
```

Согласуй это правило с текущим конфигом проекта: не добавляй дублирующий matcher, если стандартные Asset Modules уже обрабатывают `new URL` правильно.

## SpriteViewer

Webpack не предоставляет `import.meta.glob`. Передай статические lazy imports со строковыми литералами:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./ui/file-manager/svg-sprite/manifest'),
  () => import('./ui/navigation/svg-sprite/manifest'),
]

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Динамически собранный путь `import(path)` не подходит: Webpack не сможет точно связать manifests и assets. Viewer должен быть доступен только на debug/internal route.

## Проверка

```bash
npm run sprite:file-manager
npm run typecheck
```

Это быстрые обязательные проверки. После генерации проверь:

- `.svg-sprite/svg-sprite.manifest.js` содержит `target: "webpack"` и `format: "stack"`;
- generated component содержит `new URL('./sprite.svg', import.meta.url).href`;

Production build и браузер/Network нужны дополнительно, если менялись target, Webpack asset rules, `publicPath`/deployment pipeline или диагностируется runtime. Тогда проверь отдельный hashed SVG asset, HTTP(S)-URL `.svg#id`, content type, fragment ID и корректный CDN/subpath URL. Не утверждай визуальную или a11y корректность без доступных инструментов.

Для иконок с gradients, filters, masks или внутренним CSS выполни проверки из [complex-svg.md](complex-svg.md).

## Типовые ошибки

- `Unsupported React target`: программному API передано не `'webpack'`; CLI mode должен быть ровно `react@webpack`.
- Webpack пытается отрендерить SVG как React-компонент: generated sprite попал под SVGR rule; исключи его или приоритизируй `asset/resource`.
- URL ведёт на неверный host/subpath: исправь `output.publicPath` и настройки runtime deployment, не generated-файл.
- `import.meta` не поддержан: проверь, что сборка действительно Webpack 5 и промежуточный transpiler сохраняет выражение.
- Viewer не загружает manifest: проверь literal path, chunk loading и наличие генерации до компиляции.
- `Refusing to overwrite a user file`: каталог уже содержит пользовательский `.gitignore` или файл в `.svg-sprite`; перенеси его, не обходи защиту.
- Иконка не меняет цвет: используй `color` для монохромной либо `--icon-color-N` через `<svg><use>`; CSS страницы не проникает внутрь `<img>`.

Для custom build orchestration см. [programmatic-api.md](programmatic-api.md).
