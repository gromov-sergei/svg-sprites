# Standalone Vite SVG Sprite Quick Start

This guide targets the exact mode key `standalone@vite`: a native generated Web Component with Vite-managed SVG assets.

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
  mode: 'standalone@vite',
  name: 'icons',
}
```

When `input` is omitted, SVG files are read from `./icons` relative to the config. A `.js` config with a default export and a `.json` config are also supported. Generate once directly with:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts
```

Use the exact Vite dev/build commands and generate once per invocation:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts",
    "dev": "npm run sprites && vite",
    "build": "npm run sprites && vite build"
  }
}
```

Do not add `predev` or `prebuild` hooks to these scripts; that would run generation twice. In CI, replace `latest` with an exact package version.

Generation creates a local `.gitignore`; commit that file once, but do not commit `.svg-sprite/`. The generated JavaScript and declarations live together, and the declarations are self-contained: they do not require `@gromlab/svg-sprites`.

### Production usage

Register the generated element once, then use `<icons-icon>`:

```ts
// src/main.ts
import {
  defineIconsIconElement,
  iconsIconNames,
} from './ui/icons/.svg-sprite/index.js'

defineIconsIconElement()
console.log('Available icons:', iconsIconNames)
```

```html
<icons-icon icon="check" role="img" aria-label="Complete"></icons-icon>
```

The host is `1em` by `1em`, so `font-size` controls its default size. Transformed colors use `currentColor` and custom properties such as `--icon-color-1`:

```css
icons-icon {
  font-size: 24px;
  color: #2563eb;
  --icon-color-2: #dbeafe;
}
```

Vite handles the generated `sprite.svg?no-inline` import automatically and emits a separate asset. If your own TypeScript source imports Vite query assets, include Vite's ambient types:

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

Register the Viewer element, import its type, and assign the generated JavaScript manifest to `sources`:

```ts
import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import spriteManifest from './ui/icons/.svg-sprite/svg-sprite.manifest.js'

document.querySelector<HTMLDivElement>('#debug')!.innerHTML = `
  <gromlab-sprite-viewer viewer-title="Project icons"></gromlab-sprite-viewer>
`

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.sources = [spriteManifest]
```

Keep this code on a debug route or in an internal tool. Viewer is not part of the production icon runtime.

## 3. Type the config

Choose one of these two paths.

### With a local package installation

After installing the package locally, use the helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'standalone@vite',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Copy a mode-specific type directly into the config:

```ts
type LocalSpriteConfig = {
  mode: 'standalone@vite'
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
  mode: 'standalone@vite',
  name: 'icons',
} satisfies LocalSpriteConfig
```
