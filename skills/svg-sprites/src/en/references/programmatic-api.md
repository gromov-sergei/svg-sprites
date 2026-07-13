# Programmatic API: operational reference

Use `generateSprite(source, overrides?)` as the primary Node.js API.

## From a config file

```ts
import { generateSprite } from '@gromlab/svg-sprites'

await generateSprite('src/ui/icons/svg-sprite.config.ts')
```

`source` must point to a specific `.ts`, `.js`, or `.json` file. The file name is arbitrary and no discovery is performed. Its directory becomes the sprite module root and the base for relative paths.

## Without a config file

```ts
await generateSprite('src/ui/icons', {
  mode: 'react@vite',
  name: 'app',
  inputFolder: './icons',
})
```

A directory enables config-less mode. `mode` must exist after settings are merged.

## Overrides

```ts
await generateSprite('src/ui/icons/custom.json', {
  mode: 'react@webpack',
  inputFiles: ['../../shared/search.svg'],
  transform: { addTransition: false },
})
```

Values are applied as `defaults → config → API overrides`. `transform` is merged by field; a supplied `inputFiles` replaces the config array.

The specialized `generateReactSprite` and `generateNextSprite` functions remain as compatibility wrappers, but prefer `generateSprite` in new code.

For custom orchestration, use `loadSpriteConfig`, `validateSpriteConfig`, `resolveSpriteConfig`, `compileSpriteContent`, and `createShapeTransform`.
