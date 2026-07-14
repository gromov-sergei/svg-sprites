# Программный API: операционный reference

Используй `generateSprite(source, overrides?)` как основной Node.js API.

## Из config-файла

```ts
import { generateSprite } from '@gromlab/svg-sprites'

await generateSprite('src/ui/icons/svg-sprite.config.ts')
```

`source` должен указывать на конкретный `.ts`, `.js` или `.json` файл. Имя файла произвольное; генератор не выполняет discovery. Корнем sprite-модуля и базой относительных путей становится каталог этого файла.

## Без config-файла

```ts
await generateSprite('src/ui/icons', {
  mode: 'react@vite',
  name: 'app',
  input: './icons',
})
```

Каталог включает config-less режим. После объединения настроек `mode` обязателен.

`input?: string | string[]` по умолчанию равен `./icons`. Каждое значение задаёт папку, точный SVG-файл или glob и считается от каталога конфига либо config-less source-каталога. Папка сканируется плоско; рекурсия включается только явным glob, например `./icons/**/*.svg`. Массив объединяет источники, а элементы с префиксом `!` исключают совпадения. Каждый positive-элемент должен разрешаться хотя бы в один SVG. Итоговые файлы дедуплицируются и сортируются, а разные файлы с одинаковым basename вызывают ошибку.

## Overrides

```ts
await generateSprite('src/ui/icons/custom.json', {
  mode: 'react@webpack',
  input: [
    '../../shared/icons/**/*.svg',
    '!../../shared/icons/legacy-*.svg',
  ],
  transform: { addTransition: false },
})
```

Порядок: `defaults → config → API overrides`. `transform` объединяется по отдельным полям; переданный `input` заменяет значение из config.

Специализированные `generateReactSprite` и `generateNextSprite` оставлены как совместимые обёртки, но для нового кода предпочитай `generateSprite`.

Для загрузки и собственной оркестрации доступны `loadSpriteConfig`, `validateSpriteConfig`, `resolveSpriteConfig`, `compileSpriteContent` и `createShapeTransform`.
