# Technical reference

[← Back to home](../../README.md)

Reference for the configuration, generated API, and behavior of `@gromlab/svg-sprites`. For step-by-step setup instructions, see the guide for your stack:

- [Next.js App Router](next-app.md)
- [Next.js Pages Router](next-pages.md)
- [React + Vite](react-vite.md)
- [React + Webpack 5](react-webpack.md)
- [Native HTML and classic SVG sprites](legacy.md)

## Requirements

- Node.js 18 or newer;
- the package is distributed as ESM and is loaded with `import`;
- React 18 or 19 is required for generated components and `@gromlab/svg-sprites/react`;
- for typed package exports, use TypeScript 5+ with `moduleResolution: "bundler"`, `"node16"`, or `"nodenext"`.

Install the package as a development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

## CLI and generation modes

The CLI accepts one mode and a path to the configuration directory:

```text
svg-sprites --mode <mode> <path>
```

| Environment | Mode |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |
| Classic `stack` and `symbol` sprites | `legacy` |

Modern React and Next.js modes use a local `svg-sprite.config.ts`. Legacy mode uses a separate `svg-sprites.config.ts` and is covered in [its own guide](legacy.md).

The mode must match the application's bundler. The generator creates different SVG asset integration code for Vite and for bundlers compatible with Webpack Asset Modules.

## React and Next.js configuration

Each directory containing `svg-sprite.config.ts` defines one independent sprite.

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'app',
  description: 'Shared application icons',
  inputFolder: './local-icons',
  inputFiles: [
    '../../assets/icons/search.svg',
    '../../assets/icons/settings.svg',
  ],
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  generatedNotice: true,
})
```

For React, use `defineReactSpriteConfig`. The configuration contract is the same:

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'
```

| Option | Type | Default | Purpose |
|---|---|---|---|
| `name` | `string` | Derived from the directory | Name of the sprite, component, and public types |
| `description` | `string` | None | Description for types and the debug manifest |
| `inputFolder` | `string` | `./icons` | SVG directory relative to the configuration file |
| `inputFiles` | `string[]` | `[]` | Paths to individual SVG files relative to the configuration file |
| `transform` | `TransformOptions` | All enabled | SVG preparation settings |
| `generatedNotice` | `boolean` | `true` | Full or abbreviated warning in generated files |

### Sprite name

`name` is written in kebab-case and must start with an ASCII letter:

```text
app          → AppIcon
file-manager → FileManagerIcon
```

If `name` is omitted, the generator derives it from the directory. For a directory named `svg-sprite` or `svg-sprites`, the parent directory's name is used.

### Icon sources

`inputFolder` and `inputFiles` are combined into one set. This lets you keep local SVG files next to a module and add shared icons from other parts of the project without copying them.

If `inputFiles` is populated and the implicit `./icons` directory does not exist, generation uses only the file list. An explicitly configured `inputFolder` that does not exist is an error.

Only the top level of the directory is scanned. Nested directories are not traversed recursively. For a nested structure, list the exact paths through `inputFiles`.

Identical absolute paths are deduplicated. Different SVG files with the same file name are treated as a conflict because the public icon name is derived from the basename.

## Generated module

After generation, the sprite directory looks like this:

```text
app-icons/
├── .gitignore
├── index.ts
├── manifest.ts
├── svg-sprite.config.ts
└── generated/
    ├── .svg-sprites.manifest.json
    ├── react-component.tsx
    ├── sprite.svg
    ├── styles.module.css
    └── types.ts
```

| File | Purpose |
|---|---|
| `index.ts` | Production exports for the component, props, styles, and icon names |
| `manifest.ts` | Debug metadata and the asset URL for `SpriteViewer` |
| `generated/sprite.svg` | Compiled SVG sprite |
| `generated/react-component.tsx` | Typed React component |
| `generated/styles.module.css` | Base styles and transitions |
| `generated/types.ts` | Runtime list and union type of icon names |
| `generated/.svg-sprites.manifest.json` | List of files managed by the generator |

The generator overwrites and deletes only files that contain its marker. If a user file occupies a managed path, generation fails.

## React component and TypeScript

A sprite with `name: 'app'` exports:

```ts
export { AppIcon, appIconNames }
export type { AppIconName, AppIconProps, AppIconStyle }
```

### Icon names

SVG file names become valid `icon` values:

```tsx
<AppIcon icon="search" />
<AppIcon icon="unknown" /> // TypeScript error
```

The runtime list contains the same values:

```ts
import { appIconNames } from '@/ui/app-icons'

// readonly ['search', 'settings', 'user']
```

Names containing spaces or other characters that are unsafe in SVG IDs remain part of the public API. For the internal fragment ID, the generator creates a stable, safe hash:

```text
folder open.svg → icon="folder open" → id="icon-<stable-hash>"
```

For these names, use the generated component or the `id` from the debug manifest instead of constructing the fragment ID manually.

### SVG attributes

By default, the component renders an `<svg>` and accepts standard SVG attributes:

```tsx
<AppIcon
  icon="search"
  width={24}
  height={24}
  color="rebeccapurple"
  className="searchIcon"
  aria-label="Search"
/>
```

The component does not add accessibility semantics automatically. Pass appropriate `aria-*` attributes, a `role`, or a label based on the icon's purpose.

### Wrapper

`wrapped` renders a `<span>` containing the SVG. In this mode, the remaining props apply to the `<span>`:

```tsx
<AppIcon icon="search" wrapped className="iconWrapper" />
```

### Typed CSS custom properties

`AppIconStyle` extends `CSSProperties` and supports properties in the form `--icon-color-N`:

```tsx
<AppIcon
  icon="user"
  style={{
    '--icon-color-1': '#2563eb',
    '--icon-color-2': '#dbeafe',
  }}
/>
```

## Multiple sprites

Each directory with a configuration creates an independent component, types, manifest, and SVG asset:

```text
app-icons       → AppIcon       → shared icons
analytics-icons → AnalyticsIcon → analytics page icons
editor-icons    → EditorIcon    → editor icons
```

The same source SVG can be added to multiple configurations through `inputFiles`. You do not need to copy the file into each sprite directory.

For multiple sprites, add a separate CLI command for each directory or combine the commands in a shared npm script.

## Formats and rendering methods

Modern React and Next.js modes generate the `stack` format. Legacy mode supports both `stack` and `symbol`.

| Format | `<svg><use>` | `<img>` | CSS background |
|---|---:|---:|---:|
| `stack` | Yes | Yes | Yes |
| `symbol` | Yes | No | No |

### Generated component

For React and Next.js, use the generated component. It knows the internal IDs, constructs the URL, and provides a TypeScript API:

```tsx
<AppIcon icon="search" width={24} height={24} />
```

### Manually with `<svg><use>`

How you obtain `spriteUrl` depends on the bundler.

Vite:

```ts
import spriteUrl from './generated/sprite.svg?no-inline'
```

Webpack 5, Turbopack, and Next.js:

```ts
const spriteUrl = new URL('./generated/sprite.svg', import.meta.url).href
```

After obtaining the URL, use it in JSX:

```tsx
<svg width="24" height="24" aria-label="Search">
  <use href={`${spriteUrl}#search`} />
</svg>
```

For names that are unsafe as SVG IDs, use the internal `id` from the manifest.

### With `<img>`

```tsx
<img src={`${spriteUrl}#search`} width={24} height={24} alt="Search" />
```

An SVG inside `<img>` is isolated from the page's CSS. Setting `color` or `--icon-color-N` on the outer element does not change its internal colors.

### With CSS

```css
.icon {
  background: url('./generated/sprite.svg#search') center / contain no-repeat;
}
```

For a single-color silhouette, you can use a mask:

```css
.icon {
  background-color: currentColor;
  mask: url('./generated/sprite.svg#search') center / contain no-repeat;
}
```

A mask does not preserve original colors, gradients, or differences between `fill` and `stroke`.

The path in CSS is resolved relative to the CSS file itself. In these examples, the CSS file is next to `svg-sprite.config.ts`.

## Assets and caching

The generated component passes the SVG to the bundler as a separate asset:

- Vite uses a static import with `?no-inline`;
- Webpack 5, Turbopack, and Next.js use `new URL(..., import.meta.url)`;
- SVG path data is not serialized into the generated TSX.

With standard asset naming, the bundler adds a content hash:

```text
/assets/sprite-<hash>.svg
```

This allows the SVG to be cached separately from JavaScript. Changing React code does not change the sprite contents, while changing icons creates a new asset version.

HTTP cache headers, CDN behavior, and `Cache-Control` are configured by the application or hosting platform. With Webpack, the final file name depends on the project's `assetModuleFilename`.

## SVG transformations

All transformations are enabled by default and can be configured independently:

| Option | Behavior |
|---|---|
| `removeSize` | Removes `width` and `height` from the root `<svg>` while preserving an existing `viewBox` |
| `replaceColors` | Replaces detected `fill` and `stroke` values with `--icon-color-N` |
| `addTransition` | Adds transitions for `fill` and `stroke` to colored elements and generated styles |

To disable an individual operation:

```ts
export default defineNextSpriteConfig({
  transform: {
    removeSize: false,
    replaceColors: false,
    addTransition: false,
  },
})
```

Source SVG files are not modified. Transformations apply only to the generated sprite contents.

## Color management

### Monochrome icons

If one color is detected, its fallback becomes `currentColor`:

```svg
stroke="var(--icon-color-1, currentColor)"
```

Set the color through a prop or CSS:

```tsx
<AppIcon icon="search" color="rebeccapurple" />
```

### Multicolor icons

Each unique color gets its own custom property with the original color as its fallback:

```svg
fill="var(--icon-color-1, #798198)"
fill="var(--icon-color-2, #ffffff)"
fill="var(--icon-color-3, #129d9d)"
```

You can override only the values you need:

```css
.icon {
  --icon-color-1: #4b5563;
  --icon-color-3: #14b8a6;
}
```

### Limitations

- `none`, `transparent`, `inherit`, `unset`, and `initial` are not replaced;
- colors in `fill`, `stroke`, and inline `style` attributes are handled most reliably;
- CSS classes and external stylesheets inside the SVG are not the primary transformation use case;
- `url(#...)` values may be replaced along with colors, so gradients and patterns require a separate sprite with `replaceColors: false`;
- masks, filters, and complex internal CSS rules require visual verification;
- page CSS custom properties are available through `<svg><use>`, but not inside `<img>` or a CSS background.

For a complex icon, you can disable `replaceColors` in a separate sprite configuration.

## SpriteViewer

`SpriteViewer` is imported from a separate client entry point:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
```

It accepts ready-made manifests, an array of lazy loaders, or a record in the format returned by `import.meta.glob`.

Vite:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type { SpriteManifestModule } from '@gromlab/svg-sprites/react'

const sources = import.meta.glob<SpriteManifestModule>(
  '/src/**/svg-sprite/manifest.ts',
)

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} title="Project icons" />
)
```

Webpack and Next.js:

```tsx
const sources = [
  () => import('@/ui/app-icons/manifest'),
  () => import('@/features/analytics/icons/manifest'),
]

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} />
)
```

The Viewer displays groups, search, `viewBox`, CSS custom properties, fallback colors, and React, SVG, IMG, and CSS examples. You can change color values in the interface and immediately inspect the result.

### Viewer theme

By default, `colorTheme="auto"` follows `prefers-color-scheme`. You can explicitly pass `light` or `dark`:

```tsx
<SpriteViewer sources={sources} colorTheme="dark" />
```

To synchronize it with the application theme:

```tsx
<SpriteViewer
  sources={sources}
  colorTheme={appTheme}
  onColorThemeChange={setAppTheme}
/>
```

`@gromlab/svg-sprites/react` contains `'use client'`. In the Next.js App Router, place the Viewer inside a separate Client Component boundary and use it only on a debug route or in an internal tool.

## Generated files, Git, and CI

A modern sprite module creates a local `.gitignore` for:

```text
/generated/
/index.ts
/manifest.ts
```

Commit the local `.gitignore` to the repository once. It excludes the other generated files, so generation must run before commands that import the sprite module:

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode next@app/turbopack src/ui/app-icons",
    "predev": "npm run sprites",
    "prebuild": "npm run sprites",
    "pretypecheck": "npm run sprites"
  }
}
```

CI must install development dependencies and run the generation script before building or type-checking.

If the sprite directory already contains a user-created `.gitignore`, `index.ts`, or `manifest.ts`, the generator will not overwrite it. Move the user file or choose a separate sprite directory.

## Troubleshooting

- Missing `index.ts`: run the generation script before importing the module.
- Configuration not found: check the CLI path and the `svg-sprite.config.ts` file name.
- Icon missing from the type: check `inputFiles`, the `.svg` extension, and the nesting level under `inputFolder`.
- Name conflict: two different SVG files have the same basename; rename one of them.
- `Refusing to overwrite a user file`: a file without the generated marker occupies a managed path.
- The icon does not change color: use `<svg><use>` or the generated component and check `replaceColors`.
- Webpack emits an incorrect URL: check Asset Modules, `output.publicPath`, and SVG loaders.
- The Viewer cannot find the sprite: check the path to `manifest.ts` and run generation before starting the application.
- Build and mode do not match: use the target that corresponds to the actual bundler.

For custom orchestration and low-level compilation, see the [Programmatic API](programmatic-api.md).
