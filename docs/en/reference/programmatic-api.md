# Programmatic API

[Documentation index](../README.md)

The package is ESM-only and provides one Node.js generation API. The framework-neutral Viewer is available from `@gromlab/svg-sprites/viewer`, its auto-register entry from `@gromlab/svg-sprites/viewer/element`, and the React bridge from `@gromlab/svg-sprites/react`.

## `generateSprite`

```ts
import { generateSprite } from '@gromlab/svg-sprites'

const result = await generateSprite(
  'src/ui/file-manager/svg-sprite/svg-sprite.config.ts',
)
```

For static standalone mode, use `result.spritePath` in a build script to publish the
SVG under an application URL:

```ts
import { copyFile } from 'node:fs/promises'

const result = await generateSprite('src/sprite/svg-sprite.config.ts', {
  mode: 'standalone',
})
await copyFile(result.spritePath, 'dist/app-icons/sprite.svg')
```

`spritePath` is a filesystem path, not a browser URL. A deployment-neutral JSON
manifest is available through `result.manifestPath` and is copied independently.

The first argument accepts the full path to an explicitly selected `.ts`, `.js`, or `.json` config file with any name. Passing a directory enables config-less mode and uses that directory as the sprite module root.

The second argument contains optional overrides and always takes precedence over the config:

```ts
await generateSprite('src/ui/file-manager/svg-sprite/custom-config.json', {
  mode: 'react@webpack',
  name: 'documents',
  input: ['./assets', '../../shared/search.svg'],
  transform: {
    addTransition: false,
  },
  generatedNotice: false,
})
```

Configuration is resolved in this order:

```text
defaults → config → API overrides
```

For fully programmatic generation, pass a directory and provide the required settings as overrides:

```ts
await generateSprite('src/ui/file-manager/svg-sprite', {
  mode: 'react@vite',
  name: 'file-manager',
  input: [
    '../../shared/search.svg',
    '../../shared/settings.svg',
  ],
})
```

## Configuration

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'file-manager',
  description: 'File manager icons',
  input: ['./icons', '../../shared/check.svg'],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

`input` accepts one folder, SVG file, or glob pattern, or an array that combines them. When omitted, it defaults to `./icons`; relative paths start at the config directory.

`defineSpriteConfig` is an identity helper for TypeScript autocomplete. JavaScript can export the same object with `export default`, while JSON contains the object directly.

## Specialized wrappers

The specialized functions are available as wrappers around `generateSprite`:

```ts
import { generateNextSprite, generateReactSprite } from '@gromlab/svg-sprites'

await generateReactSprite('path/to/config.ts', 'vite')
await generateNextSprite('path/to/config.ts', {
  router: 'app',
  bundler: 'turbopack',
})
```

An explicitly supplied target overrides `mode` from the file. Prefer `generateSprite` in new code.

## Config API

```ts
import {
  loadSpriteConfig,
  resolveSpriteConfig,
  validateSpriteConfig,
} from '@gromlab/svg-sprites'
```

- `loadSpriteConfig(file)` loads an explicitly selected `.ts`, `.js`, or `.json` file.
- `validateSpriteConfig(value)` performs runtime validation.
- `resolveSpriteConfig(root, config, overrides)` merges values, applies defaults, and resolves paths relative to `root`.

## Low-level compiler

```ts
import {
  compileSprite,
  compileSpriteContent,
  createShapeTransform,
} from '@gromlab/svg-sprites'
```

These functions are intended for custom orchestration. Standard generation should use `generateSprite`.

## Viewer runtime

```ts
import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
```

The browser entry registers `<gromlab-sprite-viewer>`. Bare standalone can also load the self-contained `dist/viewer-element.js` without a bundler.

The React bridge keeps the component API:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
```

`SpriteViewer` accepts generated manifests, remote standalone sources, lazy loaders, or an `import.meta.glob` result. The React entry contains `'use client'` and is intended for debug tools; production components are imported from local sprite modules.
