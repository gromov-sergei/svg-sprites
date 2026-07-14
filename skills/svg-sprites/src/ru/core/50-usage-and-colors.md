## Использование, доступность и цвета

Имя компонента зависит от `name` конкретного спрайта. В `standalone@vite` и `standalone@webpack` значение `name: 'file-manager'` создаёт tag `<file-manager-icon>` и функцию `defineFileManagerIconElement()`:

```ts
import { defineFileManagerIconElement } from './svg-sprite'

defineFileManagerIconElement()
```

```html
<file-manager-icon icon="folder" aria-hidden="true"></file-manager-icon>
```

Нативный элемент не имеет runtime-зависимостей, сам выбирает generated ID и `viewBox`, получает URL через bundler и рендерит `<svg><use>` в Shadow DOM. Его property `icon` типизирован точным union имён, но строковые HTML attributes проверяются только в runtime. Размер по умолчанию равен `1em × 1em`; меняй его через CSS на host. Bare `standalone` Web Component не генерирует.

В React/Next.js тот же `name: 'file-manager'` создаёт React-компонент `FileManagerIcon`. Для `name: 'navigation'` используй сгенерированный `NavigationIcon`.

Импортируй компонент из корня соответствующего каталога спрайта. `width` и `height` не обязательны: размером можно управлять обычным CSS-классом.

```tsx
import { FileManagerIcon } from './svg-sprite'

export const OpenButton = () => (
  <button type="button">
    <FileManagerIcon icon="folder" className="icon" aria-hidden="true" />
    <span>Открыть</span>
  </button>
)
```

```css
.icon {
  width: 24px;
  height: 24px;
  color: #4b5563;
}
```

`icon` принимает точные имена исходных файлов без `.svg`; неизвестное имя является ошибкой TypeScript. Для небезопасных SVG ID имён генератор хранит публичное имя, но создаёт внутренний стабильный hash ID, поэтому не собирай fragment URL из имени вручную.

По умолчанию компонент рендерит `<svg>` и принимает стандартные SVG attributes: необязательные `width`/`height`, `className`, `style`, `role`, `aria-*` и обработчики. С `wrapped={true}` корнем становится `<span>`, props относятся к span, а внутренний SVG занимает размер wrapper. Это удобно, когда размер и цвета полностью задаются классом:

```tsx
<FileManagerIcon
  icon="check"
  wrapped
  className="statusIcon"
  aria-hidden="true"
/>
```

```css
.statusIcon {
  width: 1.5rem;
  height: 1.5rem;
  color: currentColor;
  --icon-color-1: #4b5563;
  --icon-color-2: #14b8a6;
}
```

Generated-компонент не выбирает семантику за приложение и не добавляет `title`. Для декоративной иконки передай `aria-hidden="true"`; для самостоятельной смысловой иконки передай `role="img"` и доступное имя через `aria-label`. Не дублируй имя, если соседний текст уже озвучивает действие. Интерактивность размещай на `button` или `a`, а не на самой иконке.

Трансформации `removeSize`, `replaceColors` и `addTransition` включены по умолчанию. Для монохромной иконки единственный цвет получает fallback `currentColor`, поэтому управляй CSS-свойством `color`. Для многоцветной передавай типизированные custom properties:

```tsx
<FileManagerIcon
  icon="folder"
  wrapped
  className="folderIcon"
  style={{
    '--icon-color-1': '#4b5563',
    '--icon-color-2': '#14b8a6',
  }}
/>
```

Автозамена рассчитана на `fill`/`stroke` attributes и inline `style`. Значения `none`, `transparent`, `inherit`, `unset`, `initial` не заменяются. CSS-классы и внешние stylesheets, gradients, patterns, filters и `url(#...)` проверяй на реальном результате. Переменные страницы работают через `<svg><use>`, но не проникают во внешний документ при `<img>` или `background-image`; CSS mask оставляет только одноцветный силуэт.

`SpriteViewer` необязателен. Установи `@gromlab/svg-sprites` как development dependency, только если проекту нужен Viewer, и подключай его из `@gromlab/svg-sprites/react` на debug-маршруте:

- в Vite передай результат строкового literal `import.meta.glob('/src/**/svg-sprite/.svg-sprite/svg-sprite.manifest.js')`;
- в Webpack передай массив статических `() => import('.../.svg-sprite/svg-sprite.manifest.js')`;
- в Next.js используй такие же статические loaders, а для App Router помести Viewer в отдельный файл с `'use client'`.

Viewer принимает manifests/loaders, показывает поиск, темы, цвета и примеры, но production-компоненты от него не зависят.
