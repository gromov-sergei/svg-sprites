# React Webpack SVG Sprite Quick Start

This guide targets the exact mode key `react@webpack`: a generated typed React component using Webpack 5 Asset Modules and CSS Modules.

## 1. Generate the sprite

No package installation and no `package.json` dependency are needed. `npx` downloads the CLI temporarily, and generated runtime does not import `@gromlab/svg-sprites`.

Keep the config adjacent to its source icons:

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
  mode: 'react@webpack',
  name: 'icons',
}
```

When `input` is omitted, SVG files are read from `./icons` relative to the config. A `.js` config with a default export and a `.json` config are also supported. Generate directly with:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts
```

Use the exact Webpack 5 flags and generate once per invocation:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts",
    "dev": "npm run sprites && webpack serve --mode development",
    "build": "npm run sprites && webpack --mode production"
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
      <IconsIcon icon="folder" width={24} height={24} aria-label="Files" />
      <small>{iconsIconNames.length} icons available</small>
    </main>
  )
}
```

The generated component uses `new URL('../sprite.svg', import.meta.url)`, which Webpack 5 processes through Asset Modules and emits as a separate SVG asset. Exclude `.svg-sprite/sprite.svg` from SVG component or SVGR rules so they do not intercept that URL dependency.

The generated component also imports `react-component.module.css`. Configure `.module.css` through `css-loader` with modules enabled, plus `style-loader` or `MiniCssExtractPlugin`:

```js
// webpack.config.js (relevant rule)
export default {
  module: {
    rules: [
      {
        test: /\.module\.css$/i,
        use: ['style-loader', { loader: 'css-loader', options: { modules: true } }],
      },
    ],
  },
}
```

## 2. Debug and preview

This section is optional. Only users who need the Viewer or icon previews should install:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Use the React `SpriteViewer` bridge with a static loader array. Keep every `import()` path a string literal so Webpack can create the chunk:

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
  mode: 'react@webpack',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Copy a mode-specific type directly into the config:

```ts
type LocalSpriteConfig = {
  mode: 'react@webpack'
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
  mode: 'react@webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```
