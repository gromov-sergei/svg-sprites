# React Vite SVG Sprite Quick Start

This guide targets the exact mode key `react@vite`: a generated typed React component with a Vite-managed SVG asset.

## 1. Generate the sprite

No package installation and no `package.json` dependency are needed. `npx` downloads the CLI temporarily, and generated runtime does not import `@gromlab/svg-sprites`.

Keep the config and source icons together:

```text
src/ui/icons/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Use a plain default object export with no package import:

```ts
// src/ui/icons/svg-sprite.config.ts
export default {
  mode: 'react@vite',
  name: 'icons',
}
```

When `input` is omitted, SVG files are read from `./icons` relative to the config. A `.js` config with a default export and a `.json` config are also supported. Generate directly with:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts
```

Use the exact Vite dev/build commands and generate once per invocation:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts",
    "dev": "npm run sprites && vite",
    "build": "npm run sprites && tsc --noEmit && vite build"
  }
}
```

Do not add `predev` or `prebuild` hooks to these scripts; that would run generation twice. In CI, replace `latest` with an exact package version.

Generation creates a local `.gitignore`; commit that file once, but do not commit `.svg-sprite/`. Generated declarations are self-contained and do not require the package.

### Production usage

Import the generated component and icon-name list directly:

```tsx
// src/App.tsx
import {
  IconsIcon,
  iconsIconNames,
} from './ui/icons/.svg-sprite/index.js'

export function App() {
  return (
    <main>
      <IconsIcon icon="check" width={24} height={24} aria-label="Complete" />
      <small>{iconsIconNames.length} icons available</small>
    </main>
  )
}
```

`icon` is a generated union of SVG file names. Vite automatically handles the generated CSS Module and the `sprite.svg?no-inline` import, emitting the sprite as a separate asset. If your own TypeScript source imports Vite query assets, include Vite's ambient types:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## 2. Debug and preview

This section is optional. Only users who need the Viewer or icon previews should install:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Use the React `SpriteViewer` bridge with a static loader array. Keep every `import()` path a string literal:

```tsx
// src/IconsDebugPage.tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./ui/icons/.svg-sprite/svg-sprite.manifest.js'),
]

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Project icons" />
}
```

Keep this component on a debug route or in an internal tool. Viewer is not part of the production icon runtime.

## 3. Type the config

Choose one of these two paths.

### With a local package installation

After installing the package locally, use the helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@vite',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Copy a mode-specific type directly into the config:

```ts
type LocalSpriteConfig = {
  mode: 'react@vite'
  name?: string
  description?: string
  input?: string | string[]
  transform?: {
    removeSize?: boolean
    replaceColors?: boolean
    addTransition?: boolean
  }
  generatedNotice?: boolean
}

export default {
  mode: 'react@vite',
  name: 'icons',
} satisfies LocalSpriteConfig
```
