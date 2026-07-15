# SVG Sprite for Webpack 5 Without a Framework

A quick guide to creating an SVG sprite in a Webpack 5 application without a framework.

## Generate the sprite

Choose a folder for the sprite. This example uses `assets/app-icons`, with source SVG files, including the `check.svg` used below, in `assets/svg-icons`.

Create `assets/app-icons/svg-sprite.config.json`:

```json
{
  "mode": "standalone@webpack",
  "name": "app",
  "input": "../svg-icons/**/*.svg"
}
```

The `input` path is relative to the config folder.

Add generation commands to `package.json`. Generated files are excluded from Git by default, so `predev` and `prebuild` rebuild the sprite before every start and build:

```json
{
  "scripts": {
    "sprites": "npx --yes @gromlab/svg-sprites assets/app-icons/svg-sprite.config.json",
    "predev": "npm run sprites",
    "dev": "webpack serve --mode development",
    "prebuild": "npm run sprites",
    "build": "webpack --mode production"
  }
}
```

## Use the sprite

The value `name: "app"` creates the `<app-icon>` element.

Create the entry point `assets/app-icons/index.ts`:

```ts
export * from './.svg-sprite/index.js'
```

Register the element in the application's main entry:

```ts
import { defineAppIconElement } from '../assets/app-icons'
import './style.css'

defineAppIconElement()
```

Use the icon in HTML:

```html
<app-icon icon="check" role="img" aria-label="Done"></app-icon>
```

The file `check.svg` is available as `icon="check"`. Set its size and colors with CSS:

```css
app-icon {
  font-size: 24px;
  color: #334155;
  --icon-color-2: #f59e0b;
}
```

A monochrome icon inherits `color`, while colors in a multicolor icon are overridden with `--icon-color-N`. Viewer shows the variables you need.

Webpack 5 automatically adds `sprite.svg` to the production build.

## Debug and preview

Viewer displays all icons on one page so you can check their rendering, change colors, and inspect the related CSS variables. It is only needed for development.

Install Viewer:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Create the entry `src/svg-sprite-debug.ts`:

```ts
import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import spriteManifest from '../assets/app-icons/.svg-sprite/svg-sprite.manifest.js'

const viewer = document.createElement('gromlab-sprite-viewer') as SpriteViewerElement
viewer.viewerTitle = 'Project icons'
viewer.sources = [spriteManifest]
document.body.append(viewer)
```

Add the script to the main entry only in development mode. Keep the rest of your `webpack.config.js` settings:

```js
export default (_env, argv) => ({
  // Other Webpack settings.
  entry: [
    './src/main.ts',
    ...(argv.mode === 'development' ? ['./src/svg-sprite-debug.ts'] : []),
  ],
})
```

Run `npm run dev`. Viewer appears on the application's main page.

Viewer is only added to the development build and is not included in production.
