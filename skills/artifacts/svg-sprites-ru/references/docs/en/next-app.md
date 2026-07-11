# Next.js App Router

[← Back to home](../../README.md)

Two explicit modes are supported:

| Bundler | Mode key | Next.js version |
|---|---|---|
| Turbopack | `next@app/turbopack` | 16.2+ |
| Webpack 5 | `next@app/webpack` | 13.4+ |

## 1. Install the package

```bash
npm install @gromlab/svg-sprites
```

## 2. Create a sprite module

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

```ts
// src/ui/file-manager/svg-sprite/svg-sprite.config.ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'File manager icons',
})
```

## 3. Add generation

For Turbopack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@app/turbopack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager"
  }
}
```

For Webpack, replace the mode key with `next@app/webpack`. In Next 13–15, Webpack is used with the regular `next build` command; in Next 16, use `next build --webpack`.

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
  () => import('@/ui/file-manager/svg-sprite/manifest'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} />
}
```

## Verify the bundler

```bash
# Turbopack
npx next build --turbopack

# Webpack 5
npx next build --webpack
```

For Next 13–15 with Webpack, use `npx next build` without the flag.

The Next.js command and the generator mode key must target the same bundler.
