# React с Vite: операционный reference

## Когда открывать

Открывай этот документ, если проект использует React без Next.js и собирается Vite, либо если generated-компонент содержит импорт `sprite.svg?no-inline`. Не применяй этот target к Webpack: для него открой [react-webpack.md](react-webpack.md).

## Сначала установи контекст

1. Проверь `package.json`: должны быть React, Vite и фактические команды `dev`, `build`, `typecheck`.
2. Найди существующие `svg-sprite.config.ts` и scripts с `svg-sprites`. Не создавай второй каталог для уже существующего спрайта.
3. Выбери целевой каталог для конкретного спрайта. Это не обязан быть каталог module или feature: генератор принимает каталог с config, а не путь к самому config или `icons/`.
4. Не редактируй вручную `.svg-sprite` и локальный `.gitignore`: ими владеет генератор. Корневой `index.ts` принадлежит приложению.

Минимальная структура:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

## Настройка

Установи пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

`src/ui/file-manager/svg-sprite/svg-sprite.config.ts`:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
})
```

- Каждый такой config описывает один конкретный спрайт; в приложении может быть много независимых config и спрайтов.
- Все пути в конфиге разрешаются относительно каталога `svg-sprite.config.ts`.
- `inputFolder` по умолчанию равен `./icons`; сканирование папки не рекурсивно и включает файлы с окончанием `.svg`.
- `inputFolder` и `inputFiles` объединяются, одинаковый абсолютный путь дедуплицируется.
- Если `inputFiles` заполнен, а неявного `./icons` нет, генерация работает только по списку. Явно заданная отсутствующая `inputFolder` всегда является ошибкой.
- Разные файлы с одинаковым basename, например два `check.svg`, конфликтуют как одно публичное имя иконки.
- `name` должен быть kebab-case и начинаться с латинской буквы. `FileManagerIcon`, `FileManagerIconName` и `fileManagerIconNames` ниже — только пример generated-имён для `name: 'file-manager'`.
- React preset всегда создаёт формат `stack`; выбрать `symbol` здесь нельзя.

## Команда и scripts

Добавь локальный CLI в `package.json` и запускай до процессов, которым нужны generated imports:

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

Если в проекте уже есть `predev` или `prebuild`, объедини команды в существующем orchestration вместо перезаписи script.

Для первой генерации запусти `npm run sprite:file-manager`.

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

Для обычного импорта используй пользовательский barrel с `export * from './.svg-sprite'`; остальные файлы скрытого каталога считаются внутренними.

## Нюанс target

Vite target генерирует статический импорт:

```ts
import spriteUrl from './sprite.svg?no-inline'
```

Query `?no-inline` обязателен: он не даёт Vite превратить небольшой SVG в data URL. Не удаляй query и не копируй generated SVG в `public`; Vite должен выпустить отдельный asset с content hash.

Для низкоуровневого `<use>` применяй тот же механизм:

```tsx
import spriteUrl from './svg-sprite/.svg-sprite/sprite.svg?no-inline'

<svg className="icon">
  <use href={`${spriteUrl}#check`} />
</svg>
```

Ручной fragment `#check` безопасен только для имён вида `^[a-zA-Z][a-zA-Z0-9_-]*$`. Для пробелов и других символов generated-компонент использует стабильный hash ID; точный ID находится в `.svg-sprite/svg-sprite.manifest.js`.

## SpriteViewer

После генерации добавь Viewer только на debug-маршрут:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type { SpriteManifestModule } from '@gromlab/svg-sprites/react'

const sources = import.meta.glob<SpriteManifestModule>(
  '/src/**/svg-sprite/.svg-sprite/svg-sprite.manifest.js',
)

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Аргумент `import.meta.glob` должен оставаться строковым литералом. Генерация обязана завершиться до старта Vite, иначе новые manifests не попадут в glob.

## Проверка результата

```bash
npm run sprite:file-manager
npm run typecheck
```

Это быстрые обязательные проверки. Проверь generated-файлы статически:

- пользовательский `index.ts` переэкспортирует компонент, props, style, union имени и runtime-массив из `.svg-sprite`;
- `.svg-sprite/svg-sprite.manifest.js` содержит `target: "vite"`, `format: "stack"` и ожидаемое число иконок;

Если менялись target, asset pipeline или диагностируется runtime, дополнительно запусти production build. При наличии браузерных инструментов проверь Network: отдельный `.svg` asset вместо `data:image/svg+xml`, успешный URL и `<use href="...svg#...">`. Для сложных цветов, `defs` и размеров следуй [complex-svg.md](complex-svg.md), не утверждая визуальный или a11y результат без доступных инструментов.

## Типовые ошибки

- Config не найден: передай полный путь к существующему `.ts`, `.js` или `.json` config-файлу.
- `Sprite mode is required`: добавь `mode: 'react@vite'` в config либо передай `--mode react@vite`.
- Иконки нет в autocomplete: проверь case-sensitive окончание `.svg`, нерекурсивное расположение и повторно запусти генерацию до typecheck.
- `Refusing to overwrite a user file`: не удаляй marker и не обходи writer; перенеси пользовательский файл или выбери другой sprite-каталог.
- Viewer пуст: проверь строковый glob, существование `.svg-sprite/svg-sprite.manifest.js` и порядок запуска `predev`.
- SVG оказался inline: проверь, что модуль сгенерирован target `vite` и импорт сохранил `?no-inline`.
- TypeScript не разрешает package subpath: используй TypeScript 5+ и `moduleResolution: "bundler"`, `"node16"` или `"nodenext"`.

Для запуска без CLI используй [programmatic-api.md](programmatic-api.md).
