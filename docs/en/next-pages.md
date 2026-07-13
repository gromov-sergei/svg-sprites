# Next.js Pages Router

[← Back to home](../../README.md)

Two explicit modes are supported:

| Bundler | Mode key |
|---|---|
| Turbopack | `next@pages/turbopack` |
| Webpack 5 | `next@pages/webpack` |

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
  mode: 'next@pages/webpack',
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

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager"
  }
}
```

For Turbopack, replace the mode key with `next@pages/turbopack`.

Run the first generation before importing the generated module:

```bash
npm run sprite:file-manager
```

## 4. Use it on a page

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function FilesPage() {
  return <FileManagerIcon icon="folder" width={24} height={24} />
}

export function getServerSideProps() {
  return { props: {} }
}
```

The component works the same way with SSR, SSG, and client-side navigation. Next.js emits a separate SVG asset with a content hash.

## 5. Add SpriteViewer

```tsx
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
