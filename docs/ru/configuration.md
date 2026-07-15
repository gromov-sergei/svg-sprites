# Конфигурация

Каждый config-файл описывает один независимый спрайт. CLI не ищет конфиг автоматически, поэтому всегда передавайте путь явно:

```bash
npx --yes @gromlab/svg-sprites path/to/svg-sprite.config.json
```

## JSON

JSON подходит для большинства проектов и не требует локальной установки пакета:

```json
{
  "mode": "next@app/turbopack",
  "name": "app",
  "description": "Общие иконки приложения",
  "input": [
    "./icons",
    "../../assets/icons/**/*.svg",
    "!../../assets/icons/deprecated-*.svg"
  ],
  "transform": {
    "removeSize": true,
    "replaceColors": true,
    "addTransition": true
  },
  "generatedNotice": true
}
```

| Поле | По умолчанию | Назначение |
|---|---|---|
| `mode` | Нет | Exact mode, соответствующий framework и сборщику |
| `name` | Kebab-case имени каталога модуля; для `svg-sprite` и `svg-sprites` — имени родительского каталога | Имя спрайта; в modes с компонентом также задаёт имя компонента и типов |
| `description` | Нет | Описание для типов и Viewer |
| `input` | `./icons` | Каталог, SVG-файл, glob-шаблон или массив источников |
| `transform` | Все включены | Настройки подготовки SVG |
| `generatedNotice` | `true` | Вид предупреждения в generated-файлах |

Пути и glob-шаблоны в `input` считаются от каталога config-файла. Паттерн с префиксом `!` исключает совпадения.

## JavaScript

JavaScript-конфиг экспортирует обычный объект по умолчанию:

```js
export default {
  mode: 'react@vite',
  name: 'icons',
  input: './icons',
}
```

Передайте CLI путь к `.js`-файлу так же, как к JSON:

```bash
npx --yes @gromlab/svg-sprites path/to/svg-sprite.config.js
```

## TypeScript

Для проверки конфига TypeScript установите пакет как dev dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Используйте `defineSpriteConfig`:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'icons',
  input: './icons',
})
```

Или примените `satisfies` с type-only импортом:

```ts
import type { SpriteConfig } from '@gromlab/svg-sprites'

export default {
  mode: 'react@vite',
  name: 'icons',
  input: './icons',
} satisfies SpriteConfig
```

CLI загружает `.ts`-конфиг напрямую:

```bash
npx --yes @gromlab/svg-sprites path/to/svg-sprite.config.ts
```

Полный список modes, CLI-флагов, правил именования и transform-опций находится в [техническом справочнике](reference/technical.md).
