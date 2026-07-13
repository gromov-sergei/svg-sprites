# React with Webpack 5: operational reference

## When to use this reference

Use this document for a React application built with Webpack 5 when SVGs must be processed through Asset Modules. If the project uses Vite, see [react-vite.md](react-vite.md). For Next.js, do not select `react@webpack`; router-specific targets are documented in [next-app.md](next-app.md) and [next-pages.md](next-pages.md).

## Diagnose the environment before making changes

1. Confirm Webpack major version 5 in `package.json` or the lockfile.
2. Inspect `.svg` entries in `module.rules`, `output.publicPath`, the dev server, and existing asset conventions.
3. Find existing `svg-sprite.config.ts` files and generation scripts.
4. Choose the project directory for the specific sprite. It does not have to match a module or feature directory. Pass the full path to its config file.

Minimal structure:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

## Configuration and generation

Install the package as a development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'react@webpack',
  name: 'file-manager',
  description: 'File manager icons',
  inputFolder: './icons',
  inputFiles: ['../../../../shared/icons/check.svg'],
})
```

Each config describes one of potentially many independent application sprites.

Paths are relative to `svg-sprite.config.ts`. The folder is scanned only at its top level. `inputFolder` and `inputFiles` are merged; duplicate paths are deduplicated, but equal basenames from different files cause an ID conflict. The implicit `./icons` folder may be absent when `inputFiles` is non-empty; an explicitly configured missing folder is an error. `FileManagerIcon` below is only an example generated name for `name: 'file-manager'`.

Recommended lifecycle hooks:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "predev": "npm run sprite:file-manager",
    "prebuild": "npm run sprite:file-manager",
    "pretypecheck": "npm run sprite:file-manager"
  }
}
```

Do not overwrite existing pre-scripts; add generation to their current command chain. Run `npm run sprite:file-manager` for the first generation. The React preset always emits `stack`.

## Public component

```tsx
import { FileManagerIcon } from './svg-sprite'

export function OpenFolderButton() {
  return (
    <button type="button">
      <FileManagerIcon icon="folder" className="icon" aria-hidden />
      Open
    </button>
  )
}
```

`width` and `height` are optional in JSX; set the size with a CSS class or `wrapped`. The user-owned barrel also exports `FileManagerIconProps`, `FileManagerIconStyle`, `FileManagerIconName`, and `fileManagerIconNames`. Do not edit `.svg-sprite` or the generated `.gitignore`.

## Webpack target behavior

The generated component obtains its URL only through this static expression:

```ts
const spriteUrl = new URL('./sprite.svg', import.meta.url).href
```

Webpack 5 recognizes it as an Asset Module and replaces it with the public URL of a separate SVG. For correct handling:

- do not move the path into a variable or modify the generated expression;
- ensure Babel/TypeScript does not transform `import.meta.url` before Webpack processes it;
- do not let `@svgr/webpack`, `svg-inline-loader`, `raw-loader`, or a general SVG rule intercept `svg-sprite/.svg-sprite/sprite.svg`;
- with custom rules, either exclude the generated sprite from component/raw loaders or add a dedicated `type: 'asset/resource'` rule;
- check `output.publicPath`, especially for CDN, subpath, and dev-server deployments.

Example dedicated rule when an existing loader intercepts every SVG:

```js
{
  test: /svg-sprite[\\/]\.svg-sprite[\\/]sprite\.svg$/,
  type: 'asset/resource',
}
```

Integrate this rule with the project's current configuration; do not add a duplicate matcher when standard Asset Modules already handle `new URL` correctly.

## SpriteViewer

Webpack does not provide `import.meta.glob`. Pass static lazy imports with string-literal paths:

```tsx
import { SpriteViewer } from '@gromlab/svg-sprites/react'

const sources = [
  () => import('./ui/file-manager/svg-sprite/manifest'),
  () => import('./ui/navigation/svg-sprite/manifest'),
]

export function IconsDebugPage() {
  return <SpriteViewer sources={sources} title="Project icons" />
}
```

A dynamically assembled `import(path)` is not suitable: Webpack cannot reliably associate the manifests with their assets. Expose the Viewer only on a debug/internal route.

## Verification

```bash
npm run sprite:file-manager
npm run typecheck
```

These are the required quick checks. After generation, verify that:

- `.svg-sprite/svg-sprite.manifest.js` contains `target: "webpack"` and `format: "stack"`;
- the generated component contains `new URL('./sprite.svg', import.meta.url).href`.

A production build and browser/Network checks are additionally required when the target, Webpack asset rules, `publicPath`/deployment pipeline changed, or a runtime issue is being diagnosed. In that case, verify a separate hashed SVG asset, an HTTP(S) `.svg#id` URL, content type, fragment ID, and the correct CDN/subpath URL. Do not claim visual or accessibility correctness without the necessary tools.

For icons with gradients, filters, masks, or internal CSS, perform the checks in [complex-svg.md](complex-svg.md).

## Common failures

- `Unsupported React target`: the programmatic API received a value other than `'webpack'`; the CLI mode must be exactly `react@webpack`.
- Webpack tries to render the SVG as a React component: the generated sprite matched the SVGR rule; exclude it or prioritize `asset/resource`.
- URL points to the wrong host/subpath: fix `output.publicPath` and runtime deployment settings, not the generated file.
- `import.meta` is unsupported: confirm the build really uses Webpack 5 and that an intermediate transpiler preserves the expression.
- Viewer does not load the manifest: check the literal path, chunk loading, and generation before compilation.
- `Refusing to overwrite a user file`: the directory already contains a user-owned `.gitignore` or file in `.svg-sprite`; move it rather than bypassing protection.
- Icon color does not change: use `color` for monochrome icons or `--icon-color-N` through `<svg><use>`; page CSS does not cross into `<img>`.

For custom build orchestration, see [programmatic-api.md](programmatic-api.md).
