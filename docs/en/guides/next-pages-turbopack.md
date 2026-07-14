# Next.js Pages Router Turbopack SVG Sprite Quick Start

This guide targets the exact mode key `next@pages/turbopack`: a generated typed React icon for the Next.js Pages Router and Turbopack.

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
  mode: 'next@pages/turbopack',
  name: 'icons',
}
```

When `input` is omitted, SVG files are read from `./icons` relative to the config. A `.js` config with a default export and a `.json` config are also supported. Generate directly with:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts
```

Generate once per invocation and keep the exact Turbopack flags on both commands:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.ts",
    "dev": "npm run sprites && next dev --turbopack",
    "build": "npm run sprites && next build --turbopack"
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

The component works with SSR, SSG, and client-side navigation. Turbopack resolves the generated SVG URL and CSS Module and emits a separate asset. Keep the mode and the `--turbopack` dev/build flags aligned.

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
  mode: 'next@pages/turbopack',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Copy a mode-specific type directly into the config:

```ts
type LocalSpriteConfig = {
  mode: 'next@pages/turbopack'
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
  mode: 'next@pages/turbopack',
  name: 'icons',
} satisfies LocalSpriteConfig
```
