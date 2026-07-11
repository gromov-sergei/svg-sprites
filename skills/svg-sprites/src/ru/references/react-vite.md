# React с Vite: операционный reference

## Когда открывать

Открывай этот документ, если проект использует React без Next.js и собирается Vite, либо если generated-компонент содержит импорт `sprite.svg?no-inline`. Не применяй этот target к Webpack: для него открой [react-webpack.md](react-webpack.md).

## Сначала установи контекст

1. Проверь `package.json`: должны быть React, Vite и фактические команды `dev`, `build`, `typecheck`.
2. Найди существующие `svg-sprite.config.ts` и scripts с `svg-sprites`. Не создавай второй каталог для уже существующего спрайта.
3. Выбери целевой каталог для конкретного спрайта. Это не обязан быть каталог module или feature: генератор принимает каталог с config, а не путь к самому config или `icons/`.
4. Не редактируй вручную `generated/`, `index.ts`, `manifest.ts` и локальный `.gitignore`: ими владеет генератор.

Минимальная структура:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

## Настройка

`src/ui/file-manager/svg-sprite/svg-sprite.config.ts`:

```ts
export default {
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
}
```

- Для обычной CLI-генерации пакет устанавливать не нужно. Если он уже установлен локально ради SpriteViewer или программного API, `defineReactSpriteConfig(...)` можно использовать как необязательный helper для autocomplete.
- Каждый такой config описывает один конкретный спрайт; в приложении может быть много независимых config и спрайтов.
- Все пути в конфиге разрешаются относительно каталога `svg-sprite.config.ts`.
- `inputFolder` по умолчанию равен `./icons`; сканирование папки не рекурсивно и включает файлы с окончанием `.svg`.
- `inputFolder` и `inputFiles` объединяются, одинаковый абсолютный путь дедуплицируется.
- Если `inputFiles` заполнен, а неявного `./icons` нет, генерация работает только по списку. Явно заданная отсутствующая `inputFolder` всегда является ошибкой.
- Разные файлы с одинаковым basename, например два `check.svg`, конфликтуют как одно публичное имя иконки.
- `name` должен быть kebab-case и начинаться с латинской буквы. `FileManagerIcon`, `FileManagerIconName` и `fileManagerIconNames` ниже — только пример generated-имён для `name: 'file-manager'`.
- React preset всегда создаёт формат `stack`; выбрать `symbol` здесь нельзя.

## Команда и scripts

Точная команда для примера выше:

```bash
npx --yes @gromlab/svg-sprites@latest --mode react@vite src/ui/file-manager/svg-sprite
```

Закрепи её в `package.json` и запускай до процессов, которым нужны generated imports:

```json
{
  "scripts": {
    "sprite:file-manager": "npx --yes @gromlab/svg-sprites@latest --mode react@vite src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Если в проекте уже есть `predev` или `prebuild`, объедини команды в существующем orchestration вместо перезаписи script.

## Использование

Импортируй только публичный локальный entry:

```tsx
import { FileManagerIcon, fileManagerIconNames } from './svg-sprite'
import type { FileManagerIconName, FileManagerIconStyle } from './svg-sprite'

const colorStyle: FileManagerIconStyle = {
  '--icon-color-1': '#2563eb',
}

export function FolderIcon({ icon }: { icon: FileManagerIconName }) {
  return <FileManagerIcon icon={icon} className="icon" style={colorStyle} />
}

export const availableIcons = fileManagerIconNames
```

`width` и `height` в JSX необязательны: размер можно задать CSS-классом. Без `wrapped` компонент рендерит `<svg>` и принимает SVG attributes. С `wrapped={true}` корнем становится `<span>`, а внутренний SVG занимает его ширину и высоту:

```tsx
<FileManagerIcon icon="folder" wrapped className="iconBox" />
```

Не делай deep import из `generated/`: структура generated-файлов не является точкой интеграции.

## Нюанс target

Vite target генерирует статический импорт:

```ts
import spriteUrl from './sprite.svg?no-inline'
```

Query `?no-inline` обязателен: он не даёт Vite превратить небольшой SVG в data URL. Не удаляй query и не копируй generated SVG в `public`; Vite должен выпустить отдельный asset с content hash.

Для низкоуровневого `<use>` применяй тот же механизм:

```tsx
import spriteUrl from './svg-sprite/generated/sprite.svg?no-inline'

<svg className="icon">
  <use href={`${spriteUrl}#check`} />
</svg>
```

Ручной fragment `#check` безопасен только для имён вида `^[a-zA-Z][a-zA-Z0-9_-]*$`. Для пробелов и других символов generated-компонент использует стабильный hash ID; точный ID находится в `manifest.ts`.

## SpriteViewer

После генерации при необходимости установи пакет и добавь Viewer только на debug-маршрут:

```bash
npm install @gromlab/svg-sprites@latest
```

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type { SpriteManifestModule } from '@gromlab/svg-sprites/react'

const sources = import.meta.glob<SpriteManifestModule>(
  '/src/**/svg-sprite/manifest.ts',
)

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Аргумент `import.meta.glob` должен оставаться строковым литералом. Генерация обязана завершиться до старта Vite, иначе новые `manifest.ts` не попадут в glob.

## Проверка результата

```bash
npm run sprite:file-manager
npm run typecheck
```

Это быстрые обязательные проверки. Проверь generated-файлы статически:

- публичный `index.ts` экспортирует компонент, props, style, union имени и runtime-массив;
- `manifest.ts` содержит `target: "vite"`, `format: "stack"` и ожидаемое число иконок;

Если менялись target, asset pipeline или диагностируется runtime, дополнительно запусти production build. При наличии браузерных инструментов проверь Network: отдельный `.svg` asset вместо `data:image/svg+xml`, успешный URL и `<use href="...svg#...">`. Для сложных цветов, `defs` и размеров следуй [complex-svg.md](complex-svg.md), не утверждая визуальный или a11y результат без доступных инструментов.

## Типовые ошибки

- `React config file not found`: в команду передан путь к `icons/` или к файлу; передай каталог, содержащий `svg-sprite.config.ts`.
- `React mode requires a target`: использован `--mode react`; нужен ровно `react@vite`.
- Иконки нет в autocomplete: проверь case-sensitive окончание `.svg`, нерекурсивное расположение и повторно запусти генерацию до typecheck.
- `Refusing to overwrite a user file`: не удаляй marker и не обходи writer; перенеси пользовательский файл или выбери другой sprite-каталог.
- Viewer пуст: проверь строковый glob, существование generated `manifest.ts` и порядок запуска `predev`.
- SVG оказался inline: проверь, что модуль сгенерирован target `vite` и импорт сохранил `?no-inline`.
- TypeScript не разрешает package subpath: используй TypeScript 5+ и `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

Для запуска без CLI используй [programmatic-api.md](programmatic-api.md).
