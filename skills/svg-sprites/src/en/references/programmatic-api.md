# Programmatic API: operational reference

## Required installation

```bash
npm install --save-dev @gromlab/svg-sprites
```

Programmatic imports require the local development dependency shown above. This reference describes the installed package API.

## When to use this reference

Use this document when generation runs from an ESM build script, monorepo orchestration, custom CLI, or test rather than directly from a package script. For ordinary integration, prefer the CLI references: [react-vite.md](react-vite.md), [react-webpack.md](react-webpack.md), [next-app.md](next-app.md), [next-pages.md](next-pages.md), or [legacy.md](legacy.md).

## Runtime and TypeScript

The main entry point is ESM-only and does not import React:

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'
```

Node.js 18+ is required. Do not use `require()`. The `@gromlab/svg-sprites/react` package subpath requires TypeScript 5+ with `moduleResolution: "bundler"`, `"node16"`, or `"nodenext"`.

## React module

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'

const result = await generateReactSprite(
  'src/ui/file-manager/svg-sprite',
  'vite',
)
```

Target signature:

```ts
type ReactAssetTarget = 'vite' | 'webpack'
```

`root` is resolved relative to the current `process.cwd()`. It is the selected directory for the specific sprite, not a required module/feature directory. Within it, the function loads only `svg-sprite.config.ts`, merges `inputFolder` and `inputFiles`, compiles `stack`, and safely updates managed files. Each such config describes one of potentially many sprites.

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

Pass the target explicitly. A value outside the union synchronously throws `Unsupported React asset target`.

## Next.js module

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

```ts
type NextSpriteGenerationOptions = {
  router: 'app' | 'pages'
  bundler: 'turbopack' | 'webpack'
}
```

The result contains the React result fields, a `next@<router>/<bundler>` target, and `router` and `bundler`. Next generation always uses `stack` and includes a root `viewBox`. The selected options must match the actual Next build command.

## Config helpers and loaders

Helpers only return the object and provide autocomplete; they do not load files or run validation:

```ts
import {
  defineLegacyConfig,
  defineNextSpriteConfig,
  defineReactSpriteConfig,
  loadLegacyConfig,
  loadReactSpriteConfig,
} from '@gromlab/svg-sprites'
```

```ts
const reactConfig = await loadReactSpriteConfig(
  'src/ui/file-manager/svg-sprite',
)

const legacyConfig = await loadLegacyConfig('.')
```

`loadReactSpriteConfig(root)` resolves `inputFolder`/`inputFiles` from `root` and returns a normalized config. Despite its name, Next mode uses the same loader.

`loadLegacyConfig(cwd)` looks for `cwd/svg-sprites.config.ts`, validates it, and converts `output` and `sprites[].input` into absolute paths relative to `cwd`.

## Legacy generation

Direct invocation:

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

```ts
type SpriteResult = {
  name: string
  format: 'symbol' | 'stack'
  spritePath: string
  iconCount: number
}
```

Important path nuance: `generateLegacy(config)` does not know the config file's location. Relative `output` and `input` paths are resolved from the current `process.cwd()`. If semantics must match the CLI for a config in another directory, call the loader first:

```ts
const config = await loadLegacyConfig('config/sprites')
const results = await generateLegacy(config)
```

## Low-level compilation

Main exports:

```ts
import {
  compileSprite,
  compileSpriteContent,
  createShapeTransform,
  generatePreview,
  resolveSpriteEntry,
  resolveSprites,
} from '@gromlab/svg-sprites'
```

Minimal in-memory example:

```ts
import { compileSpriteContent, resolveSpriteEntry } from '@gromlab/svg-sprites'

const folder = resolveSpriteEntry({
  name: 'icons',
  input: 'src/assets/icons',
  format: 'stack',
})

const bytes = await compileSpriteContent(
  folder,
  {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  { rootViewBox: false },
)
```

`compileSpriteContent` returns `Promise<Uint8Array>` and does not write to disk. `compileSprite(folder, outputDir, transform?, options?)` creates the output directory and writes `<folder.name>.sprite.svg`.

`CompileSpriteOptions.rootViewBox` defaults to `false`; the standard Next preset passes `true`, while React and legacy leave it `false`. Do not change this option in an attempt to replace the target: it does not determine how the asset is published.

`resolveSpriteEntry` and `resolveSprites` resolve source paths relative to `process.cwd()`, verify existence, and read only the top level of a directory. They do not implement local `inputFolder + inputFiles` semantics; use the high-level generators for standard React/Next modules.

`createShapeTransform(options)` returns a transform callback for `svg-sprite`. It is an integration primitive, not a `string -> string` function.

`generatePreview(results, outputDir)` expects every `results[].spritePath` to exist and writes `preview.html` from the package template. Do not invoke it before compilation.

## React debug runtime

The Viewer is exposed through a separate client entry:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type {
  SpriteManifest,
  SpriteManifestLoader,
  SpriteManifestModule,
  SpriteViewerColorTheme,
  SpriteViewerProps,
  SpriteViewerSources,
} from '@gromlab/svg-sprites/react'
```

`SpriteViewerSources` accepts an array or record of manifests/loaders, including the result of Vite's `import.meta.glob`. A loader may return a manifest directly or a module with `default`/`spriteManifest`. An invalid module fails with `The loaded module does not export a valid SVG sprite manifest.`

The package React entry contains `'use client'`; do not import it from server-only build scripts or production icon modules. The generated production component lives in the selected sprite directory.

## Orchestrating multiple modules

```ts
import { generateReactSprite } from '@gromlab/svg-sprites'

const roots = [
  'src/ui/global/svg-sprite',
  'src/ui/file-manager/svg-sprite',
]

const results = await Promise.all(
  roots.map((root) => generateReactSprite(root, 'vite')),
)

if (results.some((result) => result.iconCount === 0)) {
  throw new Error('Empty sprite module')
}
```

Do not run different targets concurrently for one root: both calls own the same generated paths.

## Verification and error handling

Run programmatic generation and the project's typecheck; these are the required quick checks. After invocation, inspect `result.target`, `iconCount`, and the existence of `spritePath`/`manifestPath`. Add a real bundler build and browser/Network checks only when the target/pipeline changed or a runtime issue is being diagnosed; do not claim visual or accessibility results without the necessary tools.

Common failure causes:

- an unsupported target/router/bundler was passed as an unchecked string;
- `process.cwd()` differs in a monorepo runner, so a relative root points elsewhere;
- the config has no default export;
- an explicitly configured `inputFolder` is missing;
- two source files produce the same fragment ID;
- custom orchestration attempts to overwrite a user-owned file in a managed path;
- `generatePreview` cannot find its template when running from unbuilt package sources;
- a complex SVG requires individual transforms to be disabled according to [complex-svg.md](complex-svg.md).
