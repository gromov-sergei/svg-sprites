# Next.js Pages Router: операционный reference

## Когда открывать

Открывай этот документ для страниц в `pages/` или `src/pages/`, включая SSR через `getServerSideProps`, SSG и клиентские переходы. Если маршрут находится в `app/`, используй [next-app.md](next-app.md).

## Выбор target

| Сборщик | CLI mode |
|---|---|
| Turbopack | `next@pages/turbopack` |
| Webpack 5 | `next@pages/webpack` |

Определи реальные flags scripts до выбора mode. Наличие Pages Router не означает автоматически Webpack: выбирай target по сборщику проекта.

## Структура и конфиг

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Установи пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
})
```

Каталог с config выбирает проект конкретного спрайта и не обязан быть module/feature-каталогом; каждый config описывает один из потенциально многих спрайтов приложения.

Все source paths разрешаются от каталога конфига. `inputFolder` по умолчанию `./icons`, сканирование не рекурсивно. `inputFiles` объединяется с папкой. Один и тот же путь дедуплицируется, но два разных `check.svg` конфликтуют. Явная отсутствующая папка считается ошибкой даже при заполненном `inputFiles`.

`name` задаётся в kebab-case и определяет публичные имена. `FileManagerIcon` ниже — только пример generated-имени из `name: 'file-manager'`. Next modes всегда создают `stack`, не `symbol`.

## Команды

Пример lifecycle для Webpack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@pages/webpack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Если pre-scripts уже существуют, добавь генерацию в текущую цепочку. Generated imports отсутствуют в Git, поэтому генерация должна предшествовать TypeScript и Next compilation. Для Turbopack замени mode целиком на `next@pages/turbopack`. Для первой генерации запусти `npm run sprite:file-manager`.

## Использование в Pages Router

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function FilesPage() {
  return <FileManagerIcon icon="folder" className="icon" aria-label="Папка" />
}

export function getServerSideProps() {
  return { props: {} }
}
```

`width` и `height` в JSX необязательны: размер можно задать CSS-классом или через `wrapped`. Компонент работает при SSR, SSG и client navigation. Он использует `new URL('./sprite.svg', import.meta.url).href`, чтобы Next выпустил внешний hashed asset. Не копируй generated SVG в `public` и не конструируй URL вручную.

Импортируй компонент и типы только из локального `svg-sprite/index.ts`. Не редактируй `generated/`, `index.ts`, `manifest.ts` и созданный `.gitignore`.

## SpriteViewer

Pages Router компоненты выполняются и на клиенте, поэтому отдельная директива `'use client'` не нужна:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('@/ui/file-manager/svg-sprite/manifest'),
  () => import('@/ui/navigation/svg-sprite/manifest'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} title="Иконки проекта" />
}
```

Используй literal imports и размещай страницу только как debug/internal tool. Если page участвует в production routing, ограничь доступ средствами самого приложения.

## Проверка

```bash
npm run sprite:file-manager
npm run typecheck
```

Если менялись target или Next build/deployment pipeline либо диагностируется runtime, запусти production build проекта, настроенный на выбранный сборщик:

```bash
npm run build
```

После обязательных генерации и typecheck проверь:

- `manifest.ts` содержит `next@pages/turbopack` либо `next@pages/webpack`;
- `getServerSideProps`/`getStaticProps` не импортируют package React Viewer entry.

После условного production build и только при наличии браузерных инструментов проверь SSR route и переход на него:

- initial HTML содержит `.svg#id`;
- SVG URL отвечает успешно и не является `data:`, `file:` или `blob:`;
- после client navigation иконка сохраняет тот же корректный URL;
- gradients, masks и цвета исследованы по [complex-svg.md](complex-svg.md); не утверждай визуальный или a11y результат без доступных инструментов.

## Типовые ошибки

- В mode указан `next@app/...`: модуль может сгенерироваться, но manifest и контракт target неверны; используй `next@pages/...`.
- Command и mode выбирают разные bundler: используй соответствующую build-команду проекта и перегенерируй.
- Viewer manifest не попадает в chunk: путь `import()` должен быть строковым литералом и существовать до Next build.
- Иконка есть после full reload, но пропадает при переходе: проверь доступность внешнего asset с `basePath`, `assetPrefix` и production origin.
- `Refusing to overwrite a user file`: sprite-каталог содержит неуправляемый файл с зарезервированным именем; перенеси его.
- Имя иконки отсутствует в типе: папка не сканируется рекурсивно; перемести SVG на первый уровень либо добавь точный путь в `inputFiles`.

Для программной генерации используй [programmatic-api.md](programmatic-api.md).
