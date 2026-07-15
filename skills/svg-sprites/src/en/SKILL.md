# @gromlab/svg-sprites

## What the package does

`@gromlab/svg-sprites` is a CLI generator that builds SVG sprites from user-provided SVG files. The package does not include its own icon set: it compiles project SVGs into an external sprite asset, creates a native typed Web Component for standalone bundler modes, and creates a React component for React/Next.js.

The package supports multiple independent sprites in one project. Each explicitly selected config file or config-less directory describes one sprite and gets its own:

- SVG asset;
- mode-specific manifest data;
- icon name types and production entry `.svg-sprite/index.js` for bundler modes;
- a native Web Component with an explicit registration function for `standalone@vite`/`standalone@webpack`;
- a React component only for React/Next.js;
- a deployment-neutral JSON manifest without a public URL for bare `standalone`.

The project determines how many sprite directories exist and where they live. For example, `name: 'file-manager'` produces `FileManagerIcon`, `FileManagerIconName`, and `fileManagerIconNames`, while another directory with `name: 'navigation'` produces a separate `NavigationIcon`. These are examples of per-sprite APIs, not fixed package exports.

Generated production runtime and declarations do not import `@gromlab/svg-sprites`. Generation through `npx --yes @gromlab/svg-sprites <path-to-config>` does not add the package to the project. Install it as a development dependency only for the Viewer, package-provided config types, or the programmatic API.

## Selecting a mode

Select exactly one supported mode key:

| Project | Mode key |
|---|---|
| Static HTML / custom publishing | `standalone` |
| Standalone + Vite | `standalone@vite` |
| Standalone + Webpack 5 | `standalone@webpack` |
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |

Mode may come from the config, CLI, or programmatic API. Values are applied as `defaults → config → CLI/API overrides`. A mode must exist after merging.

`name` is optional. When omitted, the generator converts the sprite-module directory name to kebab-case; directories named `svg-sprite` and `svg-sprites` use their parent directory's name. An explicit `name` must already be kebab-case and begin with an ASCII letter.

The CLI accepts exactly one path. A `.ts`, `.js`, or `.json` file loads that exact config regardless of its name. A directory enables config-less generation with settings supplied through CLI flags.

```json
{
  "scripts": {
    "sprite:<name>": "npx --yes @gromlab/svg-sprites <path-to-config>",
    "sprite:<name>:cli": "npx --yes @gromlab/svg-sprites --mode <mode-key> <sprite-directory>"
  }
}
```

Generation through `npx` does not add the package to the project. Do not use incomplete `react`, `next@app`, `next@pages`, or `standalone@` keys, or the removed `legacy` mode. Use bare `standalone` only when the application publishes the SVG itself; use the complete Vite/Webpack key otherwise. Create one command per config file or directory when the project has multiple sprites.

## Inspecting the project

Establish the project's actual contract before making changes:

1. Read the root `package.json`, lockfile, and workspace configuration; identify the framework, bundler, and existing commands.
2. Find config files, commands containing `svg-sprites`, and imports of generated components. Config names are arbitrary; use the explicit CLI path and object fields.
3. For React, determine whether the project uses Vite or Webpack 5 from its scripts and configuration. For Next.js, separately determine the App/Pages Router and the bundler used by the actual `dev`/`build` commands.
4. Check existing `predev`, `prebuild`, `pretypecheck`, and orchestration scripts. Do not overwrite them.
5. For a new sprite, choose a target directory without imposing a particular application layer or architecture.
6. Check TypeScript and alias settings. Package subpath exports require TypeScript 5+ with `moduleResolution: 'bundler'`, `'node16'`, or `'nodenext'`.

All input paths are relative to the directory containing the explicitly selected config file; in config-less mode they are relative to the supplied directory. Inspect `input` using this single contract:

- `input?: string | string[]` defaults to `./icons`;
- each string is a folder, an exact SVG file, or a glob;
- a folder is scanned shallowly; nested files are included only by an explicit recursive glob such as `./icons/**/*.svg`;
- an array combines positive sources, while an item prefixed with `!` excludes its matches from the combined set;
- every positive source must resolve to at least one SVG, so a missing or empty folder, an unmatched glob, a missing file, or a non-SVG exact file is an error;
- resolved files are deduplicated and sorted deterministically;
- different files with the same basename are a conflict, even when they came from different sources.

Do not copy a shared SVG into several folders: add its exact path or a suitable glob to `input` in every sprite that needs it. Use `**/*.svg` only when recursive inclusion is intentional.

## Setting up the integration

Do not reproduce mode setup from memory. After inspecting the project, select one exact mode and open the corresponding file under `references/docs/en/guides/`. Treat that guide as the base operational contract, then adapt it to the project's existing structure.

Work in this order:

1. Identify the source SVG directory and the directory for one sprite module. One config creates one independent sprite; multiple sets require separate config files and unique `name` values.
2. Confirm the framework, router, and bundler against the exact mode. For Next.js, inspect the actual `dev` and `build` scripts, not just the presence of `next.config.*`.
3. Prefer a JSON config when the project does not need package-provided config types. A TypeScript config also loads through the CLI, but the package must be installed when the config imports `defineSpriteConfig` or package types.
4. Resolve every `input` from the config-file directory. Do not reorganize SVGs unnecessarily: use a folder path, exact file, glob, or array of these sources.
5. Add a sprite command with an explicit config path. Preserve existing `dev`, `build`, `typecheck`, and lifecycle hooks; place generation before the first process that imports `.svg-sprite`.
6. Do not run one generation twice through both a concurrent `predev` and `npm run sprites && ...`. For multiple sprites, create separate commands and one aggregate script.
7. If the application imports the sprite-module directory, create a user-owned `index.ts` next to `.svg-sprite`; do not place user files inside the generated directory.
8. Run the first generation before typecheck or application startup, then inspect the mode-specific output and the actual component import.

Do not add the Viewer automatically. Connect it only when requested or when visual verification of the set, colors, or complex SVGs is needed. Get the production isolation pattern from the exact guide: Vite, Webpack, App Router, and Pages Router use different boundaries.

Do not copy snippets between exact modes even when their APIs look similar. Asset URLs, generated files, CSS handling, router boundaries, and debug-tool setup differ.

## Generated directory contract

After generation, a React/Next.js directory has this structure:

```text
svg-sprite/
├── icons/                              # user-owned sources
├── svg-sprite.config.json              # recommended config name
├── index.ts                            # optional user-owned barrel
├── .gitignore                          # managed by the generator
└── .svg-sprite/
    ├── index.js
    ├── index.d.ts
    ├── icon-data.js
    ├── icon-data.d.ts
    ├── sprite.svg
    ├── svg-sprite.manifest.js
    ├── svg-sprite.manifest.d.ts
    └── react/
        ├── react-component.js
        ├── react-component.d.ts
        └── react-component.module.css
```

Standalone modes do not create `react/`. Bare `standalone` generates `sprite.svg` and `svg-sprite.manifest.json`; `standalone@vite`/`standalone@webpack` additionally generate `index.*`, `icon-data.*`, and a resolved manifest. Their `index.*` also contains a native generated Web Component; bare `standalone` gets no JavaScript runtime and does not create `.gitignore`.

Edit the source SVGs, selected config, and user-owned `index.ts`. Do not manually change anything in `.svg-sprite`: the next generation will overwrite it. In every mode except bare `standalone`, the generated `.gitignore` is also managed by the generator. To import from the sprite-module root, create a barrel:

```ts
export * from './.svg-sprite/index.js'
```

The generator owns the complete `.svg-sprite` directory and replaces it on every run. Never put user files inside it. The generator also owns `.gitignore` when the selected mode creates it. Bare `standalone` preserves a user-owned `.gitignore`, but removes a managed `.gitignore` left by another mode. Generated paths must not contain symlinks.

In React/Next modes, the internal `index.js` exports the component from `react/react-component.js` and the readonly name array; `index.d.ts` adds props/style types and the icon-name union. Standalone bundler modes export Web Component helpers and types without `react/`; bare `standalone` does not create a facade. Bundler-mode manifest declarations define their types locally and do not import the generator package. The manifest contains mode, target, icon list, and icon metadata for debug tools; bundler manifests also contain a URL and are not imported by the production component.

In bundler modes, the sprite remains a separate asset and SVG path data is not embedded in JavaScript. The content hash depends on bundler settings. Bare `standalone` creates a fixed filename, and the application owns its public name and versioning:

- `react@vite` generates a static `sprite.svg?no-inline` import, preventing Vite from inlining it;
- `standalone@vite` uses the same Vite asset mechanism and exports an href helper plus a native Web Component without React;
- `standalone@webpack` uses Webpack Asset Modules and exports the same mode-local Web Component without React;
- React Webpack 5 and all Next modes obtain the asset through `new URL(..., import.meta.url).href`, which must be processed by the selected bundler;
- a custom Webpack SVG loader must not intercept the generated `sprite.svg`;
- in Next mode, the generated component does not contain `'use client'` and works in Server Components, SSR, and SSG; do not add a client boundary solely for an icon;
- the Next build command and mode key must agree: Turbopack with `.../turbopack`, Webpack with `.../webpack`.

For bundler modes, do not move the generated sprite into `public` or rewrite its URL manually. For bare `standalone`, do not move the managed original: the application may explicitly copy it into deploy output and owns the public URL and stale-copy cleanup. Regenerate with the new complete key when changing mode.

## Usage, accessibility, and colors

The component name depends on the specific sprite's `name`. In `standalone@vite` and `standalone@webpack`, `name: 'file-manager'` creates the `<file-manager-icon>` tag and the `defineFileManagerIconElement()` function:

```ts
import { defineFileManagerIconElement } from './svg-sprite'

defineFileManagerIconElement()
```

```html
<file-manager-icon icon="folder" aria-hidden="true"></file-manager-icon>
```

The native element has no runtime dependencies, selects the generated ID and `viewBox`, obtains the URL through the bundler, and renders `<svg><use>` in Shadow DOM. Its `icon` property is typed with the exact name union, while plain HTML attribute values are validated only at runtime. It defaults to `1em × 1em`; resize the host with CSS. Bare `standalone` does not generate a Web Component.

In React/Next.js, the same `name: 'file-manager'` creates the `FileManagerIcon` React component. For `name: 'navigation'`, use the generated `NavigationIcon`.

Import the component from the root of its sprite directory. `width` and `height` are optional: ordinary CSS classes can control the size.

```tsx
import { FileManagerIcon } from './svg-sprite'

export const OpenButton = () => (
  <button type="button">
    <FileManagerIcon icon="folder" className="icon" aria-hidden="true" />
    <span>Open</span>
  </button>
)
```

```css
.icon {
  width: 24px;
  height: 24px;
  color: #4b5563;
}
```

`icon` accepts exact source filenames without `.svg`; an unknown name is a TypeScript error. For names that are not safe SVG IDs, the generator preserves the public name but creates an internal stable hash ID, so do not construct a fragment URL from the name manually.

By default, the component renders `<svg>` and accepts standard SVG attributes: optional `width`/`height`, `className`, `style`, `role`, `aria-*`, and event handlers. With `wrapped={true}`, the root becomes a `<span>`, props apply to the span, and the inner SVG fills the wrapper.

The generated component does not decide semantics for the application and does not add a `title`. For a decorative icon, pass `aria-hidden="true"`; for a standalone meaningful icon, pass `role="img"` and an accessible name through `aria-label`. Do not duplicate the name when adjacent text already announces the action. Put interactivity on a `button` or `a`, not on the icon itself.

The `removeSize`, `replaceColors`, and `addTransition` transforms are enabled by default. A monochrome icon's only color gets a `currentColor` fallback, so control it with the CSS `color` property. For a multicolor icon, pass typed custom properties:

```tsx
<FileManagerIcon
  icon="folder"
  style={{
    '--icon-color-1': '#4b5563',
    '--icon-color-2': '#14b8a6',
  }}
/>
```

Automatic replacement targets `fill`/`stroke` attributes and inline `style`. The values `none`, `transparent`, `inherit`, `unset`, and `initial` are not replaced. Check CSS classes and external stylesheets, gradients, patterns, filters, and `url(#...)` against the actual output. Page variables work through `<svg><use>`, but do not cross into an external document loaded through `<img>` or `background-image`; a CSS mask preserves only a monochrome silhouette.

`SpriteViewer` is optional. Install `@gromlab/svg-sprites` as a development dependency only when the project needs the Viewer. It accepts manifests or statically discoverable loaders and provides search, themes, colors, and examples, but production components do not depend on it.

Open the exact guide before connecting the Viewer. Vite uses a separate HTML entry, plain Webpack uses a development-only entry, Next.js uses a debug route, and the App Router additionally requires a separate Client Component boundary. Do not transfer setup between modes.

## Verifying the result

After changing a config or SVG, perform these required checks:

1. Run the exact sprite command. It must exit with code `0` and report the name, icon count, mode, and `.svg-sprite` directory.
2. Inspect the output for the selected exact mode:
   - bare `standalone` creates `sprite.svg` and `svg-sprite.manifest.json`;
   - `standalone@vite` and `standalone@webpack` additionally create `index.*`, `icon-data.*`, and a JS manifest, but no `react/` directory;
   - React and Next.js modes also create `react/react-component.js`, its declaration, and its CSS Module.
3. For modes with a public facade, inspect `.svg-sprite/index.js`, the adjacent `index.d.ts`, the name list, and the actual import through the user-owned barrel.
4. Inspect the manifest: mode and target must match the selected adapter, and the icon list must match the source SVGs. In bundler modes the URL must use the mode-specific mechanism; the bare JSON manifest intentionally has no public `spriteUrl`.
5. Run the project's existing typecheck when the mode creates types or user-owned TypeScript changed.
6. Run the smallest application command affected by the change: `dev`, build, or a project-specific check.

Do not run a full production build solely to verify a new icon name. It is required when the bundler target, router, Webpack loader, asset URL, or deployment path changed, or when diagnosing a production-only error.

Perform visual, Network, and accessibility-tree checks only when a running application and browser tools are available. If those tools are unavailable, do not claim that colors, themes, accessibility, or the asset's HTTP response were verified; explicitly state what remains unchecked.

Use the Viewer for complex colors, transforms, and broad visual checks. Do not add a debug route for routine generation of one sprite.

## Diagnostics

Match the symptom to the relevant check and fix the root cause:

| Symptom | Likely cause | Action |
|---|---|---|
| `Missing sprite config file or module directory` | The positional path is missing | Pass one config file or a directory for config-less generation. |
| `Expected one config file or module directory` | Multiple paths were passed | Create one command per sprite and combine the scripts. |
| `Sprite mode is required` | Mode is absent from both config and CLI | Add `mode` to the object or pass the full `--mode`. |
| `Unsupported sprite config extension` | The supplied file is not `.ts`, `.js`, or `.json` | Use a supported config format. |
| A positive input source has no SVG matches | A folder is missing or empty, a glob matches nothing, or an exact path is missing or not an SVG | Resolve the source from the config directory and correct `input`; every positive item must produce at least one SVG. |
| Icons from a subdirectory are missing | A folder source was expected to scan recursively | Use an explicit glob such as `./icons/**/*.svg`; folders are shallow. |
| An excluded icon is still present | The exclusion lacks a leading `!`, is not in the `input` array, or is relative to the wrong directory | Add a matching `!` item and resolve it from the config directory. |
| CLI source selection is incomplete | Multiple sources were packed into one `--input` value or an option was omitted | Repeat `--input <path-or-glob>` once per source or exclusion. |
| Icon name or SVG ID collision | Two different files have the same basename, or a hash ID collides with a name | Rename one source SVG; do not select a file implicitly. |
| `Refusing to overwrite a user file` | A user-owned `.gitignore` already exists at the sprite-module root where the mode must create one | Do not overwrite it: choose another sprite directory or coordinate moving the existing `.gitignore`. |
| Missing `.svg-sprite/index.js` or name absent from autocomplete | This is expected for bare `standalone`; in other modes generation did not run, the barrel is wrong, or the type server cached an old module | Confirm the exact mode, run the sprite command, check `export * from './.svg-sprite/index.js'`, then typecheck; restart the TypeScript server if necessary. |
| SVG does not load or the URL is wrong | Mode and bundler differ, Webpack `publicPath` is wrong, or a custom loader intercepted the asset | Align mode with the build command, check Asset Modules/`publicPath`, and exclude the generated SVG from the incompatible loader. |
| Next build differs between SSR and browser | The module targets another bundler/router, or the URL was rewritten manually | Restore the generated `new URL(...)`, select the exact Next mode, and regenerate. |
| `color` does not change a multicolor icon | The icon uses several variables or is rendered through `<img>`/CSS background | Use `<FileManagerIcon>`/`<svg><use>` and the required `--icon-color-N` properties. |
| Gradient/filter renders incorrectly | Automatic color replacement cannot guarantee complex paint servers | Inspect the generated SVG; disable `replaceColors` for the sprite or simplify the source if necessary. |
| Viewer is empty | The manifest was not generated, the loader is not discoverable by the bundler, or the Client Component boundary is wrong | Generate the sprite first, then compare the manifest import and setup with the exact guide; in the App Router keep `'use client'` only in the Viewer component. |

For an unknown error, record the complete CLI command, mode, config-file or directory path, and first stack/error message. Then reduce it to one sprite without deleting user files or a managed `.gitignore`.

## Operational reference map

References are included in the built skill. Open only the documents relevant to the current task, but always open the exact-mode guide before changing an integration.

### Overview

- [Package README](./references/README.md) covers capabilities, the primary React/Next.js scenario, and documentation links.

### Configuration

- [Configuration](./references/docs/en/configuration.md) covers JSON, JavaScript, and TypeScript configs, config fields, `input`, and CLI invocation.

### Exact-mode guides

- [`standalone`](./references/docs/en/guides/standalone.md) covers static HTML and custom SVG publishing.
- [`standalone@vite`](./references/docs/en/guides/standalone-vite.md) covers a vanilla Vite application and the Web Component.
- [`standalone@webpack`](./references/docs/en/guides/standalone-webpack.md) covers a vanilla Webpack 5 application and the Web Component.
- [`react@vite`](./references/docs/en/guides/react-vite.md) covers React with Vite.
- [`react@webpack`](./references/docs/en/guides/react-webpack.md) covers React with Webpack 5.
- [`next@app/turbopack`](./references/docs/en/guides/next-app-turbopack.md) covers the Next.js App Router with Turbopack.
- [`next@app/webpack`](./references/docs/en/guides/next-app-webpack.md) covers the Next.js App Router with Webpack.
- [`next@pages/turbopack`](./references/docs/en/guides/next-pages-turbopack.md) covers the Next.js Pages Router with Turbopack.
- [`next@pages/webpack`](./references/docs/en/guides/next-pages-webpack.md) covers the Next.js Pages Router with Webpack.

### Technical references

- [Technical reference](./references/docs/en/reference/technical.md) covers requirements, CLI, unified configuration, naming, generated APIs, assets, transforms, colors, Viewer, Git, CI, and troubleshooting.
- [Programmatic API](./references/docs/en/reference/programmatic-api.md) covers `generateSprite`, overrides, config APIs, low-level compilation, and Viewer runtime.

### Agent-specific reference

- [Complex SVGs](./references/complex-svg.md) covers gradients, patterns, filters, masks, `url(#...)`, `viewBox`, fragment IDs, and visual diagnostics.
