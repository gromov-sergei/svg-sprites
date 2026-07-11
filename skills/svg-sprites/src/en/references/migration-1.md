# Migrating from the legacy 0.1.x API to latest: operational reference

## When to use this reference

Use this document only when version `0.1.x` is installed or was previously used, or when the project has old `svg-sprites` invocations without `--mode`, `defineConfig`, `generate`, `loadConfig`, a `sprites[].mode` field, `publicPath`, or a shared `<SvgSprite>` component. Do not perform this migration as an incidental refactor.

## Inventory before changes

First record the project's current contract:

```bash
npm ls @gromlab/svg-sprites
npx --yes @gromlab/svg-sprites@latest --help
```

If this is an actual migration of imports, config helpers, or the programmatic API, install the current package locally. Installation is unnecessary for CLI generation alone:

```bash
npm install @gromlab/svg-sprites@latest
```

Find and read:

- `svg-sprites.config.ts` and `svg-sprite.config.ts`;
- scripts that invoke `svg-sprites`;
- imports of `defineConfig`, `generate`, `loadConfig`, and `SvgSprite`;
- references to `publicPath`, `.sprite.svg`, the old generated component, and preview;
- `.gitignore` rules, SVG loaders, and CI generation steps.

Before changing anything, choose one of the two paths below. Do not combine them in one CLI invocation.

## Path A: retain the centralized legacy pipeline

Choose this path when the application depends on shared `public/sprites`, `symbol`, static URLs, or `preview.html`.

API mapping:

| Legacy 0.1.x API | Latest API |
|---|---|
| `defineConfig` | `defineLegacyConfig` |
| `sprites[].mode` | `sprites[].format` |
| `generate` | `generateLegacy` |
| `loadConfig` | `loadLegacyConfig` |
| CLI without mode | `npx --yes @gromlab/svg-sprites@latest --mode legacy <config-dir>` |

```ts
export default {
  output: 'public/sprites',
  preview: true,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
  ],
}
```

```bash
npx --yes @gromlab/svg-sprites@latest --mode legacy .
```

`publicPath` and generation of the old shared React component were removed. If the application used that component, legacy mode preserves the SVG asset, but the React wrapper must be replaced separately. The complete legacy workflow is in [legacy.md](legacy.md).

## Path B: move to local React/Next modules

Choose this path when typed components, bundler-hashed assets, Server Components, or splitting a large set are required.

For each required sprite, create a project directory with local `svg-sprite.config.ts` and, when using a folder, `icons/`. The directory does not have to be a module/feature directory; each config describes one of potentially many sprites:

```ts
export default {
  name: 'global',
  inputFolder: './icons',
  inputFiles: ['../../../shared/icons/check.svg'],
}
```

When the package is installed locally, the object may optionally be wrapped in `defineReactSpriteConfig(...)` or, for Next.js, `defineNextSpriteConfig(...)`. Then select exactly one mode:

| Environment | Mode |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next App + Turbopack | `next@app/turbopack` |
| Next App + Webpack 5 | `next@app/webpack` |
| Next Pages + Turbopack | `next@pages/turbopack` |
| Next Pages + Webpack 5 | `next@pages/webpack` |

Example:

```bash
npx --yes @gromlab/svg-sprites@latest --mode react@vite src/ui/global/svg-sprite
```

Replace the old generic component:

```tsx
// Before
<SvgSprite icon="check" />

// After, with name: 'global'
<GlobalIcon icon="check" />
```

The new module creates its own local `.gitignore`, `index.ts`, `manifest.ts`, and `generated/`. The bundler publishes the SVG; do not preserve the old `publicPath` or copy the sprite into `public`.

Select the detailed procedure: [react-vite.md](react-vite.md), [react-webpack.md](react-webpack.md), [next-app.md](next-app.md), or [next-pages.md](next-pages.md).

## Programmatic API changes

The package is now ESM-only:

```ts
import { compileSpriteContent, generateLegacy } from '@gromlab/svg-sprites'
```

Do not use `require()`. `compileSpriteContent(...)` now returns `Promise<Uint8Array>` rather than a Node-specific `Buffer` declaration:

```ts
const bytes = await compileSpriteContent(folder)
await fs.promises.writeFile('sprite.svg', bytes)
```

If old code called `generate`, replace it with `generateLegacy`; for local modules, use `generateReactSprite` or `generateNextSprite`. See [programmatic-api.md](programmatic-api.md) for exact signatures.

## Safe migration order

1. Record the current icon names, formats, public URLs, and color expectations.
2. When migrating imports, update the dependency to latest and update the config API, but do not delete old artifacts until new generation succeeds.
3. Add an explicit mode and directory to every local/CI script.
4. Generate the new output.
5. Replace imports and JSX usages; check the TypeScript icon-name unions.
6. If the target/pipeline changed or a runtime issue is being diagnosed, inspect asset URLs and SSR/SSG; assess visual results only with tools capable of doing so.
7. Only then remove confirmed old generated files and obsolete ignore/loader rules.

Do not delete an entire directory that may contain source SVGs or user-owned files. The current writer refuses to overwrite files without a generated marker; do not bypass this protection.

## Post-migration verification

Minimum checks for an npm project:

```bash
npm run sprites
npm run typecheck
```

Use the project's actual script names. Generation and typechecking are the required quick checks. Add a production build, browser, and Network checks only when the migration changes the target/pipeline or a runtime issue is being diagnosed. Verify that:

- no script invokes the CLI without `--mode` and a path;
- the config helper and CLI mode belong to the same pipeline;
- a local manifest contains the expected target, while legacy output uses the expected format;
- obsolete `publicPath`, `sprites[].mode`, and removed API imports are gone;
- generated files are created before typechecking/building in a clean checkout;
- every old icon name remains available or was intentionally renamed;
- colors and complex SVGs were examined according to [complex-svg.md](complex-svg.md), without claims of visual or accessibility correctness when tools are unavailable;
- `SpriteViewer` replaced a separate preview only for React/Next; legacy mode may still use `preview.html`.

## Common failures

- `Missing required argument: --mode`: an old script was not updated.
- `React mode requires a target` or `Next.js mode requires a router and bundler`: a shortened mode was used instead of the full key.
- Deprecated `mode`: a legacy entry still has `sprites[].mode`.
- `icons was renamed to inputFolder`: the old field was moved into a local React/Next config without being renamed.
- `require() of ES Module`: the build script was not converted to ESM/import.
- Icons disappeared: local `inputFolder` scanning is shallow, or shared files were not added through `inputFiles`.
- Runtime still requests old `/sprites/...` URLs: JSX/CSS usage was not migrated to the generated component or new asset URL.
- One sprite is generated with multiple targets: CI and local scripts disagree; retain one target matching the actual bundler.
