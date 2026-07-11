# Legacy mode: operational reference

## When to use this reference

Use this document when the project already has a root `svg-sprites.config.ts`, centralized output, multiple `sprites` entries, the `symbol` format, or a standalone `preview.html`. Do not migrate such a project to local React/Next modules without an explicit request; for a planned migration, open [migration-1.md](migration-1.md).

## What distinguishes legacy mode

- One config manages one or more sprites.
- Results are written as `<name>.sprite.svg` into a shared `output`.
- Both `stack` and `symbol` are supported; the default format is `stack`.
- `preview` is enabled by default and creates a shared `preview.html`.
- There is no generated React component, manifest module, local `.gitignore`, or managed-writer protection.
- Legacy paths in a loaded config are resolved relative to the directory passed to the CLI.

## Config and execution

Install the package as a development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

`svg-sprites.config.ts`:

```ts
import { defineLegacyConfig } from '@gromlab/svg-sprites'

export default defineLegacyConfig({
  output: 'public/sprites',
  preview: true,
  transform: {
    removeSize: true,
    replaceColors: true,
    addTransition: true,
  },
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
    {
      name: 'logos',
      input: [
        'src/assets/logos/product.svg',
        'src/assets/shared/brand.svg',
      ],
      format: 'stack',
    },
  ],
})
```

Unlike local React/Next configs, each of which describes one of potentially many sprites, a single legacy config retains the specific ability to manage one or more sprite entries.

Script:

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode legacy .",
    "prebuild": "npm run sprites"
  }
}
```

Run `npm run sprites` from the project root.

The CLI path points to the directory containing `svg-sprites.config.ts`. Do not pass the file itself. For a config in another directory, pass that directory explicitly.

## Input semantics

- A string `input` denotes a directory; only top-level SVG files are read, sorted by name.
- An array `input` denotes an exact file list; an empty array is an error.
- The extension check is case-sensitive and requires the `.svg` suffix.
- Every file in an array is checked for existence.
- Unlike a local React config, a legacy entry cannot merge a folder and a list. For a mixed set, list every file or split the inputs into separate entries.
- `name` is used directly in the output filename; choose unique safe names and do not create two entries with the same output name.

## Format selection and runtime

Use `symbol` for existing `<svg><use>` integration:

```html
<svg width="24" height="24" aria-label="Done">
  <use href="/sprites/icons.sprite.svg#check"></use>
</svg>
```

`stack` works with `<svg><use>`, `<img src="...svg#check">`, and CSS URLs. For new React/Next code, do not automatically build a local component over legacy output; select the appropriate modern mode first.

Page CSS custom properties control content through `<svg><use>`, but do not cross into a document loaded as `<img>` or `background-image`. `symbol` is not intended for `<img>`.

Names containing spaces or unsafe characters receive a hash ID in the form `icon-<16 hex>`. Do not assume the basename always equals the fragment; inspect the generated SVG or preview.

## Preview

With `preview: true`, `output/preview.html` is created after all SVGs. It contains data and inline copies of generated sprites. When diagnosing runtime behavior and browser tools are available, open it to inspect the icon count, `viewBox`, and `--icon-color-N` values.

With `preview: false`, no new preview is created. The generator is not a cleaner for arbitrary output files: if an old `preview.html` is no longer needed, delete it only after confirming that it is a previous generated artifact.

## Verification

```bash
npm run sprites
npm run typecheck
```

Generation and the project's typecheck are the required quick checks. For each entry, verify that:

- `public/sprites/<name>.sprite.svg` exists;
- the logged format and icon count are correct;
- the expected `<symbol id="...">` or nested `<svg id="...">` elements are present;
- `preview.html` is created only when preview is enabled;
- SVGs with complex `defs` were checked according to [complex-svg.md](complex-svg.md).

Run a production build and browser/Network checks additionally only when the output/public pipeline changed or a runtime issue is being diagnosed. In that case, inspect the real application URL with its public base path and, if visual tools are available, the contents of `preview.html`; do not claim visual or accessibility results without that verification.

## Common failures

- `Config file not found`: the CLI path is not a directory containing `svg-sprites.config.ts`.
- `Config file must have a default export`: export the config through `defineLegacyConfig(...)`.
- Deprecated `mode`: the `sprites[].mode` field was renamed to `format`.
- `sprites must be a non-empty array`: a legacy config cannot be empty.
- `Input directory does not exist` or `SVG file does not exist`: remember that paths are resolved from the config directory when loaded by the CLI.
- Nested SVGs are missing: directory scanning is not recursive.
- `Preview template not found` when running from package sources: build the package preview template; it is included in the published distribution.
- Color does not change in `<img>`: it is an isolated SVG document; use `<svg><use>` or colors defined in advance.
- Old output files remain after an entry is removed: the legacy generator writes current results but does not own cleanup of the entire output directory.

Programmatic execution variants and path-resolution differences are documented in [programmatic-api.md](programmatic-api.md).
