# Migrating from 0.1.x to 1.0

[← Back to home](../../README.md)

Version 1.0 separates local generation for React and Next.js from the centralized legacy mode. The old config cannot be mixed with the new API in a single CLI invocation.

## CLI

The CLI now always requires an explicit `--mode` and a path to the configuration directory:

```text
svg-sprites
→ svg-sprites --mode <mode> <path>
```

Choose a mode based on your environment:

| Environment | Mode |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |
| Centralized legacy setup | `legacy` |

## React and Next.js

Instead of a root-level `svg-sprites.config.ts`, create a local `svg-sprite.config.ts` next to the icon set:

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'global',
  inputFolder: './icons',
})
```

For regular React, use `defineReactSpriteConfig`. A folder and an explicit list of shared SVG files can be combined using `inputFolder` and `inputFiles`.

The old `publicPath` and `react` options are no longer needed. The generated module is created next to the config and adds its own `.gitignore`, while Vite, Webpack, or Next.js emits the SVG as a separate asset with a content hash.

The `<SvgSprite icon="..." />` component is replaced by a component whose name is derived from `name`:

```tsx
<GlobalIcon icon="check" />
```

To browse the icons, add `<SpriteViewer>` as a debug page in the application. A separate `preview.html` is available only in legacy mode.

## Legacy mode

If you need to preserve the centralized structure, rename the helper and the format fields:

```ts
import { defineLegacyConfig } from '@gromlab/svg-sprites'

export default defineLegacyConfig({
  output: 'public/sprites',
  preview: true,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'stack',
    },
  ],
})
```

- `defineConfig` has been replaced with `defineLegacyConfig`;
- `sprites[].mode` has been renamed to `sprites[].format`;
- `generate` has been replaced with `generateLegacy`;
- `loadConfig` has been replaced with `loadLegacyConfig`;
- `publicPath` and generation of the old shared React component have been removed.

Run:

```bash
svg-sprites --mode legacy .
```

## Programmatic API

The package is distributed as ESM only. Replace `require()` with `import`.

`compileSpriteContent` now returns `Promise<Uint8Array>` so that the public declarations do not require `@types/node` to be installed. In Node.js, the actual result is compatible with APIs that accept `Uint8Array`.

## After migration

1. Remove the old generated files and rules that ignored the entire directory containing the source icons.
2. Add an explicit generation command before `dev`, `build`, and `typecheck`.
3. Run generation and type checking.
4. Check all icons and color variables using `SpriteViewer` or the legacy `preview.html`.
