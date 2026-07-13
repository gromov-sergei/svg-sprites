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
  inputFolder: './icons',
})
```

Каталог включает config-less режим. После объединения настроек `mode` обязателен.

## Overrides

```ts
await generateSprite('src/ui/icons/custom.json', {
  mode: 'react@webpack',
  inputFiles: ['../../shared/search.svg'],
  transform: { addTransition: false },
})
```

Порядок: `defaults → config → API overrides`. `transform` объединяется по отдельным полям; переданный `inputFiles` заменяет массив из config.

Специализированные `generateReactSprite` и `generateNextSprite` оставлены как совместимые обёртки, но для нового кода предпочитай `generateSprite`.

Для загрузки и собственной оркестрации доступны `loadSpriteConfig`, `validateSpriteConfig`, `resolveSpriteConfig`, `compileSpriteContent` и `createShapeTransform`.
