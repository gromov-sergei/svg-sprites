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
  input: './icons',
})
```

A directory enables config-less mode. `mode` must exist after settings are merged.

`input?: string | string[]` defaults to `./icons`. Each value is a folder, an exact SVG file, or a glob, resolved from the config directory or the config-less source directory. Folder scans are shallow; recurse only with an explicit glob such as `./icons/**/*.svg`. Arrays combine sources, and items prefixed with `!` exclude matches. Every positive item must resolve to at least one SVG. The final files are deduplicated and sorted, while different files with the same basename cause an error.

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

Values are applied as `defaults → config → API overrides`. `transform` is merged by field; a supplied `input` replaces the config value.

The specialized `generateReactSprite` and `generateNextSprite` functions remain as compatibility wrappers, but prefer `generateSprite` in new code.

For custom orchestration, use `loadSpriteConfig`, `validateSpriteConfig`, `resolveSpriteConfig`, `compileSpriteContent`, and `createShapeTransform`.
