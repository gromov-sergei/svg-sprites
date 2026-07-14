# Next.js Pages Router Webpack SVG Sprite Quick Start

This guide targets the exact mode key `next@pages/webpack`: a generated typed React icon for the Next.js Pages Router and Webpack 5.

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
  mode: 'next@pages/webpack',
  name: 'icons',
}
```

When `input` is omitted, SVG files are read from `./icons` relative to the config. A `.js` config with a default export and a `.json` config are also supported. Generate directly with:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts
```

Generate once per invocation and keep the exact Webpack flags on both commands:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts",
    "dev": "npm run sprites && next dev --webpack",
    "build": "npm run sprites && next build --webpack"
  }
}
```

Do not add `predev` or `prebuild` hooks to these scripts; that would run generation twice. In CI, replace `latest` with an exact package version.

Generation creates a local `.gitignore`; commit that file once, but do not commit `.svg-sprite/`. Generated declarations are self-contained and do not require the package.

### Production usage

Import the generated component and icon-name list into a Pages Router page:

```tsx
// src/pages/index.tsx
import {
  IconsIcon,
  iconsIconNames,
} from '../ui/icons/.svg-sprite/index.js'

export default function HomePage() {
  return (
    <main>
      <IconsIcon icon="folder" width={24} height={24} aria-label="Files" />
      <p>{iconsIconNames.length} icons available</p>
    </main>
  )
}
```

The component works with SSR, SSG, and client-side navigation. Webpack resolves the generated SVG URL and CSS Module and emits a separate asset. Keep the mode and the `--webpack` dev/build flags aligned. If custom Next.js webpack rules process SVG through SVGR, exclude `.svg-sprite/sprite.svg` from those rules.

## 2. Debug and preview

This section is optional. Only users who need the Viewer or icon previews should install:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Pages Router does not require an App Router Client Component boundary. Use the React bridge directly in a page with a static loader array:

```tsx
// src/pages/icon-debug.tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('../ui/icons/.svg-sprite/svg-sprite.manifest.js'),
]

export default function IconDebugPage() {
  return <SpriteViewer sources={sources} title="Project icons" />
}
```

Keep the page internal or development-only. Viewer is not part of the production icon runtime.

## 3. Type the config

Choose one of these two paths.

### With a local package installation

After installing the package locally, use the helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@pages/webpack',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Copy a mode-specific type directly into the config:

```ts
type LocalSpriteConfig = {
  mode: 'next@pages/webpack'
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
  mode: 'next@pages/webpack',
  name: 'icons',
} satisfies LocalSpriteConfig
```
