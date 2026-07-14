# Standalone Webpack SVG Sprite Quick Start

This guide targets the exact mode key `standalone@webpack`: a native generated Web Component using Webpack 5 Asset Modules.

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
  mode: 'standalone@webpack',
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
<icons-icon
  icon="check"
  role="img"
  aria-label="Complete"
  style="font-size:24px;color:#16a34a;--icon-color-1:#16a34a"
></icons-icon>
```

The generated facade uses `new URL('./sprite.svg', import.meta.url)`, which Webpack 5 processes through Asset Modules and emits as a separate asset. If the project has SVG-to-component or SVGR rules, exclude `.svg-sprite/sprite.svg` from them so they do not intercept this URL dependency. Check `output.publicPath` if the emitted URL is wrong.

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
  mode: 'standalone@webpack',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Copy a mode-specific type directly into the config:

```ts
type LocalSpriteConfig = {
  mode: 'standalone@webpack'
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
  mode: 'standalone@webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```
