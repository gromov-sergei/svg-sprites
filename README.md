# @gromlab/svg-sprites

🇬🇧 English | [🇷🇺 Русский](README_RU.md)

![npm](https://img.shields.io/npm/v/@gromlab/svg-sprites) ![license](https://img.shields.io/npm/l/@gromlab/svg-sprites)

`@gromlab/svg-sprites` is an SVG sprite generator for modern web applications. It combines selected SVG icons into one or more external, cacheable sprites and prepares them for use in the UI.

For React and Next.js, the package generates typed components and external SVG assets with support for Vite, Webpack 5, and Turbopack.

## An SVG sprite as simple as a regular SVG icon

One typed React component is generated for the entire sprite. Choose an icon with the `icon` prop, and your editor will autocomplete every available name.

```tsx
<AppIcon icon="search" width={24} height={24} />
```

The component accepts familiar SVG attributes: dimensions, `color`, `className`, `style`, `aria-*`, and event handlers. If you need an outer container, add `wrapped`.

```tsx
<AppIcon icon="search" wrapped className="iconWrapper" />
```

You do not have to work with the sprite directly in your application. Use it like a regular SVG icon while benefiting from a single component, autocomplete, and TypeScript validation for every name.

## AI-friendly out of the box

`@gromlab/svg-sprites` is designed to work with AI agents from the start. Add the ready-made skill and ask an agent to configure, migrate, or troubleshoot the package without lengthy instructions or manual documentation research.

[🇬🇧 Download AI skill (English)](https://github.com/gromlab-ru/svg-sprites/releases/latest/download/svg-sprites.zip)

[🇷🇺 Download AI skill (Russian)](https://github.com/gromlab-ru/svg-sprites/releases/latest/download/svg-sprites-ru.zip)

## From SVG to component in four steps

The main example uses the Next.js App Router and Turbopack.

### 1. Install the package

```bash
npm install --save-dev @gromlab/svg-sprites
```

### 2. Specify the icons you need

SVG files can remain in your project's existing structure:

```text
src/
├── assets/icons/
│   ├── search.svg
│   └── settings.svg
├── features/profile/
│   └── user.svg
└── ui/app-icons/
    └── svg-sprite.config.ts
```

Create the sprite configuration:

```ts
// src/ui/app-icons/svg-sprite.config.ts
import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'next@app/turbopack',
  name: 'app',
  inputFiles: [
    '../../assets/icons/search.svg',
    '../../assets/icons/settings.svg',
    '../../features/profile/user.svg',
  ],
})
```

### 3. Add generation

```json
{
  "scripts": {
    "sprites": "svg-sprites src/ui/app-icons/svg-sprite.config.ts",
    "predev": "npm run sprites",
    "prebuild": "npm run sprites"
  }
}
```

Run it for the first time:

```bash
npm run sprites
```

The package will generate `AppIcon`, TypeScript types, and a separate SVG sprite.

### 4. Use it like a regular icon

```tsx
import { AppIcon } from '@/ui/app-icons'

export default function SearchButton() {
  return (
    <button type="button">
      <AppIcon icon="search" width={20} height={20} />
      Search
    </button>
  )
}
```

This is a Server Component. The icon does not require a provider, `'use client'`, or manual URL construction.

## Typed React component with autocomplete

Each sprite gets its own ready-to-use component. The `icon` prop is derived from the actual SVG names, so your editor shows the exact list of available icons and TypeScript catches typos immediately.

```tsx
<AppIcon icon="search" />  // available icon
<AppIcon icon="serach" />  // TypeScript error
```

After you add a new SVG icon and run generation again, its name automatically appears in the types and autocomplete. There is no need to maintain components, union types, or a name registry manually.

## Next.js App Router and SSR out of the box

Generated components work in Server Components, SSR, and SSG without `'use client'`.

Using an icon does not turn the page into a Client Component, require a provider, or create an additional hydration boundary.

The same component can be used in `page.tsx`, `layout.tsx`, and both server and client components.

## Multiple sprites instead of one global sprite

Your project is not limited to a single icon set. Create independent sprites for shared elements, individual pages, and large UI modules.

```tsx
<AppIcon icon="search" />
<AnalyticsIcon icon="chart" />
<EditorIcon icon="bold" />
```

Each set gets its own typed component and SVG asset, so application sections do not load icons they do not need.

## Store each icon only once

Each SVG icon is stored once in the source library and can be included in any number of sprites. Shared icons do not need to be copied between pages and modules: a single source updates every set.

```text
search.svg ─┬─→ AppIcon
            ├─→ AnalyticsIcon
            └─→ EditorIcon
```

Sprites are split for performance, while the source icon library remains unified.

## Browser caching

With a standard Vite, Webpack, or Next.js configuration, each sprite is emitted as a separate versioned SVG file.

As long as the icon set does not change, the browser can reuse its cached copy independently of JavaScript application updates.

Changes to React components do not require downloading the geometry of every icon again.

## JavaScript without SVG bloat

Icon paths remain in external SVG assets and do not add to application chunks.

```text
React code  → JavaScript chunks
SVG icons   → separate SVG assets
```

JavaScript handles the interface and behavior, while graphics are loaded and cached separately.

## Built-in SVG transformations

During generation, the package automatically prepares source SVG files for use in the UI:

- removes fixed `width` and `height` attributes;
- preserves the existing `viewBox`;
- converts `fill` and `stroke` values to CSS variables;
- adds smooth transitions directly to colored icon elements.

Each transformation can be configured or disabled independently.

## Control every color with CSS

During generation, `fill` and `stroke` colors are automatically converted to `--icon-color-N` CSS variables.

A monochrome icon inherits `currentColor`:

```tsx
<AppIcon icon="search" color="rebeccapurple" />
```

For a multicolor icon, each color can be changed independently:

```tsx
<AppIcon
  icon="user"
  style={{
    '--icon-color-1': '#2563eb',
    '--icon-color-2': '#dbeafe',
  }}
/>
```

Create themes, states, and hover effects without editing the SVG or making additional copies of the icon.

## SpriteViewer: every sprite on one debug page

`SpriteViewer` renders all project sprites in one place and shows which icons are included in each set and how they look.

For each icon, you can see the generated CSS variables and their fallback colors. Change the values directly in the Viewer and see the result immediately.

It also provides ready-to-use integration examples for:

- React;
- `<svg><use>`;
- `<img>`;
- CSS.

![SpriteViewer](https://raw.githubusercontent.com/gromlab-ru/svg-sprites/master/preview-image.png)

The Viewer is added only to an internal debug page and does not become part of the generated icon components.

## React and Next.js

The package generates typed React components and supports Vite, Webpack 5, Next.js App Router, and Pages Router with Turbopack or Webpack.

## Clean Git history

The generator creates a local `.gitignore` that excludes generated files and keeps them from cluttering project history, pull requests, and the codebase.

The repository contains the source SVG files, configuration, and `.gitignore` rule, while sprites, components, and types are regenerated locally and in CI through `prebuild`.

## Only icons in production

`@gromlab/svg-sprites` does its main work during generation and remains in `devDependencies`.

Production components use only local generated code, styles, and the external SVG file. The compiler and CLI are not bundled into the client application, while `SpriteViewer` is imported separately only where a debug page is needed.

## Documentation

This README introduces the project's capabilities and demonstrates the primary use case. For setup, choose the guide for your stack.

### Quick start

- [Next.js App Router](docs/en/next-app.md)
- [Next.js Pages Router](docs/en/next-pages.md)
- [React + Vite](docs/en/react-vite.md)
- [React + Webpack 5](docs/en/react-webpack.md)

### Technical resources

- [Technical reference](docs/en/reference.md)
- [Programmatic API](docs/en/programmatic-api.md)

## License

MIT
