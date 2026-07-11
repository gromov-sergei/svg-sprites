# Programmatic API

[← Back to home](../../README.md)

The package provides a main Node.js entry point and a separate React runtime entry point. Both are distributed as ESM only and must be loaded with `import`.

To resolve `@gromlab/svg-sprites/react` in TypeScript, use `moduleResolution: "bundler"`, `"node16"`, or `"nodenext"`.

## Main entry point

```ts
import {
  defineNextSpriteConfig,
  defineReactSpriteConfig,
  generateNextSprite,
  generateReactSprite,
} from '@gromlab/svg-sprites'
```

The main entry point does not import React and can be used in CLIs, build scripts, and Node.js tools.

## `generateReactSprite`

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'

const result = await generateReactSprite(
  'src/ui/file-manager/svg-sprite',
  'vite',
)
```

The second argument is required:

```ts
type ReactAssetTarget = 'vite' | 'webpack'
```

Result:

```ts
type ReactSpriteGenerationResult = {
  name: string
  rootDir: string
  generatedDir: string
  spritePath: string
  manifestPath: string
  iconCount: number
  target: 'vite' | 'webpack'
}
```

```ts
console.log(result.name)
console.log(result.iconCount)
console.log(result.spritePath)
console.log(result.manifestPath)
```

The function loads `svg-sprite.config.ts` from the specified root, compiles the SVG files, and safely updates managed files.

## `generateNextSprite`

```ts
import { generateNextSprite } from '@gromlab/svg-sprites'

const result = await generateNextSprite(
  'src/ui/file-manager/svg-sprite',
  {
    router: 'app',
    bundler: 'turbopack',
  },
)
```

Available values:

```ts
type NextSpriteGenerationOptions = {
  router: 'app' | 'pages'
  bundler: 'turbopack' | 'webpack'
}
```

The result also contains the selected `router`, `bundler`, and the full target in the form `next@app/turbopack`.

## `defineReactSpriteConfig`

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'File manager icons',
  inputFolder: './icons',
  inputFiles: [
    '../../shared/icons/check.svg',
  ],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

`inputFolder` and `inputFiles` are combined. The helper returns the configuration without runtime transformations and provides TypeScript autocomplete.

## `defineNextSpriteConfig`

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'File manager icons',
  inputFolder: './icons',
})
```

Next.js uses the same configuration contract as the React presets.

## `generateLegacy`

```ts
import { generateLegacy } from '@gromlab/svg-sprites'

const results = await generateLegacy({
  output: 'public/sprites',
  preview: false,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
  ],
})
```

Returns an array:

```ts
type SpriteResult = {
  name: string
  format: 'symbol' | 'stack'
  spritePath: string
  iconCount: number
}
```

For details, see [Legacy mode](legacy.md).

## Low-level functions

The main entry point also exports:

```ts
import {
  compileSprite,
  compileSpriteContent,
  createShapeTransform,
  generatePreview,
  loadLegacyConfig,
  loadReactSpriteConfig,
  resolveSpriteEntry,
  resolveSprites,
} from '@gromlab/svg-sprites'
```

These functions are intended for custom orchestration built on top of the existing compiler and writer. For standard usage, prefer `generateReactSprite` and `generateLegacy`.

## React runtime entry point

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
```

Types:

```ts
import type {
  SpriteManifest,
  SpriteManifestColor,
  SpriteManifestIcon,
  SpriteManifestLoader,
  SpriteManifestModule,
  SpriteViewerColorTheme,
  SpriteViewerProps,
  SpriteViewerSource,
  SpriteViewerSources,
} from '@gromlab/svg-sprites/react'
```

The React entry point contains `'use client'` and is intended for debug tools. Generated production components are imported from the application's local sprite modules, not from the package's React entry point.

`SpriteViewerProps.colorTheme` accepts `auto | light | dark`. The default is `auto`, which follows `prefers-color-scheme`; to synchronize it with the application theme, pass the computed `light` or `dark` value.

## Related guides

- [React + Vite](react-vite.md)
- [React + Webpack 5](react-webpack.md)
