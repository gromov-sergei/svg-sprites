# Standalone SVG Sprite Quick Start

This guide targets the exact mode key `standalone`: static HTML or a custom asset pipeline with no generated JavaScript facade.

## 1. Generate the sprite

No package installation and no `package.json` dependency are needed. `npx` downloads the CLI temporarily, and generated runtime does not import `@gromlab/svg-sprites`; bare `standalone` does not generate a JavaScript runtime at all.

Keep the config next to its source icons:

```text
src/ui/icons/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.json
```

Create a JSON config:

```json
{
  "mode": "standalone",
  "name": "icons"
}
```

When `input` is omitted, the generator reads `./icons` next to the config.

To include SVG files from nested directories, set one glob pattern:

```json
{
  "mode": "standalone",
  "name": "icons",
  "input": "../assets/icons/**/*.svg"
}
```

An array can mix folders, individual SVG files, and glob patterns:

```json
{
  "mode": "standalone",
  "name": "icons",
  "input": [
    "../assets/icons",
    "../features/profile/user.svg",
    "../features/admin/*.svg"
  ]
}
```

All relative paths start at the config directory. Pass the config path explicitly:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.json
```

For repeatable local commands, the same temporary CLI can be used from a script:

```json
{
  "scripts": {
    "sprites": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/icons/svg-sprite.config.json"
  }
}
```

Run that script once from your existing dev/build pipeline. If you use a `predev` or `prebuild` hook instead, do not also call `npm run sprites` inside the corresponding script. Bare `standalone` has no bundler-specific dev or build flag. In CI, replace `latest` with an exact package version.

Bare `standalone` does not create or modify `.gitignore`; the application decides whether `.svg-sprite/` is committed or ignored. It emits no declarations, facade, or component. Generated declarations in typed modes are self-contained and do not require the package.

### Production usage

The application owns the public URL, versioning, and cache policy. Copy both generated assets into the deploy output:

```bash
cp src/ui/icons/.svg-sprite/sprite.svg public/assets/icons.svg
cp src/ui/icons/.svg-sprite/svg-sprite.manifest.json public/assets/icons.manifest.json
```

Use the published URL manually:

```html
<svg width="24" height="24" role="img" aria-label="Complete">
  <use href="/assets/icons.svg#check"></use>
</svg>
```

Safe icon names normally match their fragment IDs. Names containing spaces or other SVG-ID-unsafe characters receive a generated ID; read that icon's `id` from `icons.manifest.json` instead of constructing the fragment yourself.

## 2. Debug and preview

This section is optional. Only install the package locally if you need the debug Viewer or an icon preview:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Without a bundler, self-host the browser bundle by copying it from `node_modules` into the deploy output:

```bash
cp node_modules/@gromlab/svg-sprites/dist/viewer-element.js public/debug/viewer-element.js
```

Then provide both public asset URLs through HTML attributes:

```html
<script type="module" src="/debug/viewer-element.js"></script>

<gromlab-sprite-viewer
  viewer-title="Project icons"
  manifest-url="/assets/icons.manifest.json"
  sprite-url="/assets/icons.svg"
></gromlab-sprite-viewer>
```

For a quick preview, a pinned CDN file can replace the self-hosted script:

```html
<script
  type="module"
  src="https://unpkg.com/@gromlab/svg-sprites@1.1.5/dist/viewer-element.js"
></script>
```

Self-host the file for controlled environments and pin the CDN version if you use the alternative. Viewer is optional tooling, not part of the production icon runtime.

## 3. Type the config

This guide uses a JSON config, which works without TypeScript types. If config autocomplete is needed, replace `svg-sprite.config.json` with `svg-sprite.config.ts` and choose one of these approaches.

### With a local package installation

After installing the package locally, use the helper:

```ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'standalone',
  name: 'icons',
})
```

You can alternatively import `type SpriteConfig` and apply `satisfies SpriteConfig`.

### Without the package

Keep a narrow local type directly in the config:

```ts
type LocalSpriteConfig = {
  mode: 'standalone'
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
  mode: 'standalone',
  name: 'icons',
} satisfies LocalSpriteConfig
```
