# React with Vite: operational reference

## When to use this reference

Use this document when the project uses React without Next.js and is built with Vite, or when the generated component contains a `sprite.svg?no-inline` import. Do not apply this target to Webpack; use [react-webpack.md](react-webpack.md) instead.

## Establish context first

1. Check `package.json`: confirm React, Vite, and the actual `dev`, `build`, and `typecheck` commands.
2. Find existing `svg-sprite.config.ts` files and scripts containing `svg-sprites`. Do not create a second directory for an existing sprite.
3. Choose a target directory for the specific sprite. It does not have to be a module or feature directory: the generator accepts the directory containing the config, not the config file or `icons/` path.
4. Do not manually edit `generated/`, `index.ts`, `manifest.ts`, or the local `.gitignore`; the generator owns them.

Minimal structure:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

## Setup

`src/ui/file-manager/svg-sprite/svg-sprite.config.ts`:

```ts
export default {
  name: 'file-manager',
  description: 'File manager icons',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
}
```

- The package does not need to be installed for normal CLI generation. If it is already installed locally for SpriteViewer or the programmatic API, `defineReactSpriteConfig(...)` may be used as an optional autocomplete helper.
- Each config describes one specific sprite; an application may contain many independent configs and sprites.
- Every config path is resolved relative to the directory containing `svg-sprite.config.ts`.
- `inputFolder` defaults to `./icons`; folder scanning is shallow and includes files ending in `.svg`.
- `inputFolder` and `inputFiles` are merged, and duplicate absolute paths are deduplicated.
- If `inputFiles` is non-empty and the implicit `./icons` directory is absent, generation uses only the list. An explicitly configured missing `inputFolder` is always an error.
- Different files with the same basename, such as two `check.svg` files, conflict because they define the same public icon name.
- `name` must use kebab-case and begin with an ASCII letter. `FileManagerIcon`, `FileManagerIconName`, and `fileManagerIconNames` below are only examples of generated names for `name: 'file-manager'`.
- The React preset always creates the `stack` format; `symbol` cannot be selected here.

## Command and scripts

Exact command for the example above:

```bash
npx --yes @gromlab/svg-sprites@latest --mode react@vite src/ui/file-manager/svg-sprite
```

Add it to `package.json` and run it before processes that need generated imports:

```json
{
  "scripts": {
    "sprite:file-manager": "npx --yes @gromlab/svg-sprites@latest --mode react@vite src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

If the project already has `predev` or `prebuild`, integrate generation into the existing orchestration instead of overwriting the script.

## Usage

Import only from the public local entry point:

```tsx
import { FileManagerIcon, fileManagerIconNames } from './svg-sprite'
import type { FileManagerIconName, FileManagerIconStyle } from './svg-sprite'

const colorStyle: FileManagerIconStyle = {
  '--icon-color-1': '#2563eb',
}

export function FolderIcon({ icon }: { icon: FileManagerIconName }) {
  return <FileManagerIcon icon={icon} className="icon" style={colorStyle} />
}

export const availableIcons = fileManagerIconNames
```

`width` and `height` are optional in JSX; a CSS class can control the size. Without `wrapped`, the component renders `<svg>` and accepts SVG attributes. With `wrapped={true}`, the root becomes a `<span>` and the inner SVG fills its width and height:

```tsx
<FileManagerIcon icon="folder" wrapped className="iconBox" />
```

Do not deep-import from `generated/`; its file structure is not an integration point.

## Target-specific behavior

The Vite target generates a static import:

```ts
import spriteUrl from './sprite.svg?no-inline'
```

The `?no-inline` query is required: it prevents Vite from converting a small SVG into a data URL. Do not remove the query or copy the generated SVG into `public`; Vite must emit a separate content-hashed asset.

Use the same mechanism for low-level `<use>` integration:

```tsx
import spriteUrl from './svg-sprite/generated/sprite.svg?no-inline'

<svg className="icon">
  <use href={`${spriteUrl}#check`} />
</svg>
```

A manual `#check` fragment is safe only for names matching `^[a-zA-Z][a-zA-Z0-9_-]*$`. For spaces and other characters, the generated component uses a stable hash ID; the exact ID is available in `manifest.ts`.

## SpriteViewer

After generation, install the package if needed and add the Viewer only to a debug route:

```bash
npm install @gromlab/svg-sprites@latest
```

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'
import type { SpriteManifestModule } from '@gromlab/svg-sprites/react'

const sources = import.meta.glob<SpriteManifestModule>(
  '/src/**/svg-sprite/manifest.ts',
)

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Project icons" />
}
```

The `import.meta.glob` argument must remain a string literal. Generation must finish before Vite starts, or new `manifest.ts` files will not be included in the glob.

## Verification

```bash
npm run sprite:file-manager
npm run typecheck
```

These are the required quick checks. Inspect the generated files statically:

- public `index.ts` exports the component, props, style, name union, and runtime array;
- `manifest.ts` contains `target: "vite"`, `format: "stack"`, and the expected icon count.

If the target or asset pipeline changed, or a runtime issue is being diagnosed, also run the production build. When browser tools are available, inspect Network for a separate `.svg` asset rather than `data:image/svg+xml`, a successful URL, and `<use href="...svg#...">`. For complex colors, `defs`, and dimensions, follow [complex-svg.md](complex-svg.md); do not claim a visual or accessibility result without the necessary tools.

## Common failures

- `React config file not found`: the command points to `icons/` or the config file; pass the directory containing `svg-sprite.config.ts`.
- `React mode requires a target`: `--mode react` was used; the mode must be exactly `react@vite`.
- Icon missing from autocomplete: check the case-sensitive `.svg` suffix and shallow location, then regenerate before typechecking.
- `Refusing to overwrite a user file`: do not remove the marker or bypass the writer; move the user-owned file or choose another sprite directory.
- Viewer is empty: check the literal glob, the existence of generated `manifest.ts`, and the `predev` execution order.
- SVG was inlined: confirm that the module targets `vite` and its import still contains `?no-inline`.
- TypeScript cannot resolve the package subpath: use TypeScript 5+ with `moduleResolution: "bundler"`, `"node16"`, or `"nodenext"`.

For execution without the CLI, use [programmatic-api.md](programmatic-api.md).
