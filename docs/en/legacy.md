# Legacy mode

[← Back to home](../../README.md)

A quick guide to generating centralized SVG sprites in `symbol` and `stack` formats, with an optional HTML preview.

## 1. Install the package

```bash
npm install @gromlab/svg-sprites
```

## 2. Prepare the icons and config

```text
project/
├── src/assets/icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprites.config.ts
```

```ts
// svg-sprites.config.ts
import { defineLegacyConfig } from '@gromlab/svg-sprites'

export default defineLegacyConfig({
  output: 'public/sprites',
  preview: true,
  sprites: [
    {
      name: 'icons',
      input: 'src/assets/icons',
      format: 'symbol',
    },
  ],
})
```

## 3. Run generation

```bash
npx svg-sprites --mode legacy .
```

Result:

```text
public/sprites/
├── icons.sprite.svg
└── preview.html
```

With `preview: false`, the HTML file is not created. For the `stack` format, specify `format: 'stack'`.

## 4. Use the symbol sprite

```html
<svg width="24" height="24" aria-label="Done">
  <use href="/sprites/icons.sprite.svg#check"></use>
</svg>
```

## 5. Add a package script

```json
{
  "scripts": {
    "sprites": "svg-sprites --mode legacy .",
    "prebuild": "npm run sprites"
  }
}
```

## Multiple sprites

Add multiple entries to `sprites`:

```ts
sprites: [
  {
    name: 'icons',
    input: 'src/assets/icons',
    format: 'symbol',
  },
  {
    name: 'logos',
    input: 'src/assets/logos',
    format: 'stack',
  },
]
```

All output files and the shared `preview.html` will be written to `output`.

## Troubleshooting

- Config not found: make sure `svg-sprites.config.ts` is located in the specified root directory.
- No icons: check `sprites[].input` and the `.svg` extension.
- Preview not needed: set `preview: false`.

For programmatic use, see [`generateLegacy`](programmatic-api.md#generatelegacy).
