# React + Vite

[← Back to home](../../README.md)

A quick guide to installing and using SVG sprites in a React and Vite project.

The result is a typed React component and a separate cacheable SVG asset.

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
    "sprite:file-manager": "svg-sprites --mode react@vite src/ui/file-manager/svg-sprite",
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

The name `file-manager` is converted to `FileManagerIcon`:

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
<FileManagerIcon icon="check" />   // valid
<FileManagerIcon icon="unknown" /> // TypeScript error
```

Types, rendering methods, and color controls are described in the [main documentation](../../README.md#rendering-methods).

Vite emits the sprite as a separate file named like `assets/sprite-<hash>.svg`. SVG path data is not included in JavaScript.

## 6. Add a debug page

After integrating the icons, you can display all React sprites with `SpriteViewer`:

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

Vite automatically finds the generated `manifest.ts` for each React sprite. The `import.meta.glob` pattern must be a string literal, and generation must run before Vite starts.

Only include the Viewer on a debug route or in an internal tool.

## Troubleshooting

- Missing `index.ts`: run `npm run sprite:file-manager`.
- The Viewer cannot find the sprite: check the glob path and make sure `manifest.ts` exists.
- `Refusing to overwrite a user file` error: there is a user file at a generated path.
- The icon does not change color: use `color` or `--icon-color-N`.
