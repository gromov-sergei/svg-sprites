# React + Webpack 5

[← Back to home](../../README.md)

A quick guide to installing and using SVG sprites in a React and Webpack 5 project.

The result is a typed React component and a separate SVG asset emitted through Webpack Asset Modules.

## 1. Install the package

```bash
npm install @gromlab/svg-sprites
```

## 2. Create the sprite directory

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Place the source SVG files in `icons/`.

## 3. Add the configuration

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'File manager icons',
})
```

By default, SVG files are loaded from `./icons`. You can add shared icons from other directories through `inputFiles`: the directory and file list are combined into a single sprite.

The complete list of options is available under [Configuration → React](../../README.md#react).

## 4. Add generation to package.json

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode react@webpack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Generated files are excluded from Git, so generation must run before `dev`, `build`, and `typecheck`.

First run:

```bash
npm run sprite:file-manager
```

## 5. Use the component

```tsx
import { FileManagerIcon } from './svg-sprite'

export const OpenFolderButton = () => (
  <button type="button">
    <FileManagerIcon icon="folder" width={24} height={24} />
    Open
  </button>
)
```

TypeScript checks the `icon` value against the file names:

```tsx
<FileManagerIcon icon="folder" />  // valid
<FileManagerIcon icon="missing" /> // TypeScript error
```

Types, rendering methods, and color controls are described in the [main documentation](../../README.md#rendering-methods).

Webpack processes the generated `new URL('./sprite.svg', import.meta.url)` through Asset Modules and emits a separate SVG asset.

If the project already uses a custom SVG loader, make sure it does not intercept the generated `sprite.svg` instead of Asset Modules.

## 6. Add a debug page

Webpack does not support Vite's `import.meta.glob` API, so provide static loaders:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./ui/file-manager/svg-sprite/manifest'),
  () => import('./ui/navigation/svg-sprite/manifest'),
]

export const IconsDebugPage = () => (
  <SpriteViewer sources={sources} title="Project icons" />
)
```

The paths in `import()` must be string literals. Webpack creates chunks for the manifests and associates them with the SVG assets.

Only include the Viewer on a debug route or in an internal tool.

## Troubleshooting

- Missing `index.ts`: run `npm run sprite:file-manager`.
- The Viewer does not load the sprite: check the path in `import()` and make sure `manifest.ts` exists.
- Incorrect asset URL: check `output.publicPath`.
- Another loader intercepts the SVG: exclude the generated sprite from the incompatible rule.

For Next.js, use the separate mode keys described in the [App Router](next-app.md) and [Pages Router](next-pages.md) guides.
