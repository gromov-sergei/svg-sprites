# Next.js App Router: operational reference

## When to use this reference

Use this document when the application uses `app/` or `src/app/` and needs a generated component for Server Components, SSR, or SSG. First determine the actual bundler: Turbopack and Webpack use different targets. For `pages/`, use [next-pages.md](next-pages.md).

## Target matrix

| Bundler | CLI mode |
|---|---|
| Turbopack | `next@app/turbopack` |
| Webpack 5 | `next@app/webpack` |

Do not infer the target only from the presence of `next.config.*`. Check the actual flags in `dev`/`build`. The generator mode and verification-build bundler must agree.

## Prepare the sprite directory

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

- The project chooses the directory for each specific sprite; it does not have to be a module/feature directory. Each config describes one of potentially many application sprites.
- The config filename is singular: `svg-sprite.config.ts`.
- Paths are relative to its directory; `inputFolder` scanning is shallow.
- The local folder and `inputFiles` are merged. Equal basenames from different files are forbidden.
- If no name is configured, it is derived from the directory; for a directory named `svg-sprite`, the parent directory name is used. An explicit `name` is more stable when files move.
- `name` must use kebab-case and begin with a letter.
- `FileManagerIcon` below is only an example generated name for `name: 'file-manager'`.
- The Next preset always generates `stack` and includes a root sprite `viewBox`; this is not a user setting.

## Generation

Example scripts for Turbopack:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode next@app/turbopack src/ui/file-manager/svg-sprite",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

For Webpack, replace only the complete mode with `next@app/webpack`. Do not run both targets sequentially for one directory: the second generation overwrites the first target's files. Run `npm run sprite:file-manager` for the first generation.

## Server Component

The generated production component does not contain `'use client'`. Import it directly into a server `page.tsx` or `layout.tsx`:

```tsx
import { FileManagerIcon } from '@/ui/file-manager/svg-sprite'

export default function Page() {
  return (
    <main>
      <FileManagerIcon icon="folder" className="icon" aria-label="Folder" />
    </main>
  )
}
```

`width` and `height` are optional in JSX; set the size with a CSS class or `wrapped`. Do not add a Client Component boundary solely for the icon. The generated module builds the asset URL with static `new URL('./sprite.svg', import.meta.url).href`; the same mechanism is used during SSR and in the browser.

Do not import from `generated/` or move the SVG into `public`. Managed files (`generated/`, `index.ts`, `manifest.ts`, `.gitignore`) are regenerated.

## SpriteViewer

The Viewer is interactive and imported from a client-only entry. Create a separate Client Component page or child component:

```tsx
'use client'

import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('@/ui/file-manager/svg-sprite/manifest'),
  () => import('@/ui/navigation/svg-sprite/manifest'),
]

export default function SpritesPage() {
  return <SpriteViewer sources={sources} title="Project icons" />
}
```

The `import()` paths must be string literals. Keep production icon imports outside `@gromlab/svg-sprites/react`: the package React entry is only for the Viewer and contains `'use client'`.

## Verification

Start with generation and typechecking:

```bash
npm run sprite:file-manager
npm run typecheck
```

If the target or Next build/deployment pipeline changed, or a runtime issue is being diagnosed, run the project's production build configured for the selected bundler:

```bash
npm run build
```

After the required generation and typecheck, verify that:

- `manifest.ts` contains the exact target `next@app/turbopack` or `next@app/webpack`;
- the server page compiles without adding `'use client'`.

During a conditional production/runtime check, also verify that:

- HTML contains an `href` to `.svg#id`, and the asset URL is available after `next start`;
- the URL does not use `data:`, `file:`, or `blob:`;
- SSR markup and the hydrated page refer to the same asset;
- complex SVGs were examined according to [complex-svg.md](complex-svg.md); claim visual and accessibility results only when the corresponding tools are available.

## Common failures

- `Next.js mode requires a router and bundler`: `--mode next` is invalid; specify the full mode.
- Build passes with one bundler but the runtime asset breaks with another: regenerate for the target actually used by the build.
- Webpack was selected, but the build used Turbopack: use the project's Webpack build command and `next@app/webpack`.
- Viewer causes a Server Component error: the Viewer file needs `'use client'`; the generated icon component does not.
- `React config file not found`: the command received the path to `app/`, `icons/`, or the config file instead of the sprite directory.
- Two CI jobs generate different targets in one checkout: separate their directories or ensure each job uses one consistent target.
- Asset is missing under `basePath`/CDN: inspect Next asset handling and deployment configuration; do not replace the generated URL manually.
- Package subpath type error: use TypeScript 5+ with `moduleResolution: "bundler"`, `"node16"`, or `"nodenext"`.

To invoke the generator from a build script, open [programmatic-api.md](programmatic-api.md).
