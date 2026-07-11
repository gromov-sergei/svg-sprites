# Next.js Pages Router: operational reference

## When to use this reference

Use this document for pages under `pages/` or `src/pages/`, including SSR with `getServerSideProps`, SSG, and client-side navigation. If the route is under `app/`, use [next-app.md](next-app.md).

## Selecting a target

| Bundler | CLI mode |
|---|---|
| Turbopack | `next@pages/turbopack` |
| Webpack 5 | `next@pages/webpack` |

Determine the actual script flags before selecting a mode. The presence of the Pages Router does not automatically imply Webpack; select the target from the bundler used by the project.

## Structure and config

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Install the package as a development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

```ts
import { defineNextSpriteConfig } from '@gromlab/svg-sprites'

export default defineNextSpriteConfig({
  name: 'file-manager',
  description: 'File manager icons',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
})
```

The project chooses the directory containing each specific sprite config, and it does not have to be a module/feature directory; each config describes one of potentially many application sprites.

All source paths are resolved from the config directory. `inputFolder` defaults to `./icons`, and scanning is shallow. `inputFiles` is merged with the folder. The same path is deduplicated, but two different `check.svg` files conflict. An explicitly configured missing folder is an error even when `inputFiles` is non-empty.

`name` uses kebab-case and determines the public names. `FileManagerIcon` below is only an example generated name for `name: 'file-manager'`. Next modes always create `stack`, not `symbol`.

## Commands

Example lifecycle scripts for Webpack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@pages/webpack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

If pre-scripts already exist, add generation to their current command chain. Generated imports are absent from Git, so generation must precede TypeScript and Next compilation. For Turbopack, replace the complete mode with `next@pages/turbopack`. Run `npm run sprite:file-manager` for the first generation.

## Usage in the Pages Router

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function FilesPage() {
  return <FileManagerIcon icon="folder" className="icon" aria-label="Folder" />
}

export function getServerSideProps() {
  return { props: {} }
}
```

`width` and `height` are optional in JSX; set the size with a CSS class or `wrapped`. The component works during SSR, SSG, and client navigation. It uses `new URL('./sprite.svg', import.meta.url).href` so Next emits an external hashed asset. Do not copy the generated SVG into `public` or construct the URL manually.

Import the component and types only from the local `svg-sprite/index.ts`. Do not edit `generated/`, `index.ts`, `manifest.ts`, or the generated `.gitignore`.

## SpriteViewer

Pages Router components run on the client as well, so a separate `'use client'` directive is unnecessary:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('@/ui/file-manager/svg-sprite/manifest'),
  () => import('@/ui/navigation/svg-sprite/manifest'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} title="Project icons" />
}
```

Use literal imports and expose the page only as a debug/internal tool. If the page participates in production routing, restrict access through the application's own controls.

## Verification

```bash
npm run sprite:file-manager
npm run typecheck
```

If the target or Next build/deployment pipeline changed, or a runtime issue is being diagnosed, run the project's production build configured for the selected bundler:

```bash
npm run build
```

After the required generation and typecheck, verify that:

- `manifest.ts` contains `next@pages/turbopack` or `next@pages/webpack`;
- `getServerSideProps`/`getStaticProps` does not import the package React Viewer entry.

After the conditional production build, and only when browser tools are available, inspect the SSR route and navigation to it:

- initial HTML contains `.svg#id`;
- the SVG URL responds successfully and is not `data:`, `file:`, or `blob:`;
- after client navigation, the icon keeps the same valid URL;
- gradients, masks, and colors were examined according to [complex-svg.md](complex-svg.md); do not claim a visual or accessibility result without the necessary tools.

## Common failures

- Mode uses `next@app/...`: the module may generate, but its manifest and target contract are wrong; use `next@pages/...`.
- The command and mode select different bundlers: use the project's matching build command and regenerate.
- Viewer manifest is missing from the chunk: the `import()` path must be a string literal and must exist before the Next build.
- Icon appears after a full reload but disappears during navigation: check external asset availability with `basePath`, `assetPrefix`, and the production origin.
- `Refusing to overwrite a user file`: the sprite directory contains an unmanaged file with a reserved name; move it.
- Icon name is absent from the type: folder scanning is not recursive; move the SVG to the top level or add its exact path to `inputFiles`.

For programmatic generation, use [programmatic-api.md](programmatic-api.md).
