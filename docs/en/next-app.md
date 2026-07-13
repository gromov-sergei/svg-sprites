# Next.js App Router

[← Back to home](../../README.md)

Two explicit modes are supported:

| Bundler | Mode key |
|---|---|
| Turbopack | `next@app/turbopack` |
| Webpack 5 | `next@app/webpack` |

## 1. Install the package

```bash
npm install --save-dev @gromlab/svg-sprites
```

## 2. Create a sprite module

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
├── index.ts
└── svg-sprite.config.ts
```

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@app/turbopack',
  name: 'file-manager',
  description: 'File manager icons',
})
```

The root barrel is application-owned:

```ts
// src/ui/file-manager/svg-sprite/index.ts
export * from './.svg-sprite'
```

## 3. Add generation

For Turbopack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager"
  }
}
```

For Webpack, replace the mode key with `next@app/webpack`.

Run the first generation before importing the generated module:

```bash
npm run sprite:file-manager
```

## 4. Use it in a Server Component

The generated component does not contain `'use client'`, so it can be imported directly into `page.tsx` or `layout.tsx`:

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function Page() {
  return (
    <main>
      <FileManagerIcon icon="folder" width={24} height={24} />
    </main>
  )
}
```

Next.js emits a separate SVG asset with a content hash. The same generated code is used during SSR and in the browser, with no URL mismatch.

## 5. Add SpriteViewer

The viewer is interactive, so it requires a separate Client Component boundary:

```tsx
'use client'

import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('@/ui/file-manager/svg-sprite/.svg-sprite/svg-sprite.manifest.js'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} />
}
```

## Verify the bundler

Run the project's build script configured for the selected bundler:

```bash
npm run build
```

The build script and the generator mode key must target the same bundler.
