## Usage, accessibility, and colors

The component name depends on the specific sprite's `name`. These examples use `name: 'file-manager'`, so the generated component is called `FileManagerIcon`. For `name: 'navigation'`, use the generated `NavigationIcon`.

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

By default, the component renders `<svg>` and accepts standard SVG attributes: optional `width`/`height`, `className`, `style`, `role`, `aria-*`, and event handlers. With `wrapped={true}`, the root becomes a `<span>`, props apply to the span, and the inner SVG fills the wrapper. This is convenient when a class controls both size and colors:

```tsx
<FileManagerIcon
  icon="check"
  wrapped
  className="statusIcon"
  aria-hidden="true"
/>
```

```css
.statusIcon {
  width: 1.5rem;
  height: 1.5rem;
  color: currentColor;
  --icon-color-1: #4b5563;
  --icon-color-2: #14b8a6;
}
```

The generated component does not decide semantics for the application and does not add a `title`. For a decorative icon, pass `aria-hidden="true"`; for a standalone meaningful icon, pass `role="img"` and an accessible name through `aria-label`. Do not duplicate the name when adjacent text already announces the action. Put interactivity on a `button` or `a`, not on the icon itself.

The `removeSize`, `replaceColors`, and `addTransition` transforms are enabled by default. A monochrome icon's only color gets a `currentColor` fallback, so control it with the CSS `color` property. For a multicolor icon, pass typed custom properties:

```tsx
<FileManagerIcon
  icon="folder"
  wrapped
  className="folderIcon"
  style={{
    '--icon-color-1': '#4b5563',
    '--icon-color-2': '#14b8a6',
  }}
/>
```

Automatic replacement targets `fill`/`stroke` attributes and inline `style`. The values `none`, `transparent`, `inherit`, `unset`, and `initial` are not replaced. Check CSS classes and external stylesheets, gradients, patterns, filters, and `url(#...)` against the actual output. Page variables work through `<svg><use>`, but do not cross into an external document loaded through `<img>` or `background-image`; a CSS mask preserves only a monochrome silhouette.

`SpriteViewer` is optional. Import it from `@gromlab/svg-sprites/react` only on a debug route:

- in Vite, pass the result of a string-literal `import.meta.glob('/src/**/svg-sprite/manifest.ts')`;
- in Webpack, pass an array of static `() => import('.../manifest')` loaders;
- in Next.js, use the same static loaders, and for the App Router put the Viewer in a separate file with `'use client'`.

The Viewer accepts manifests/loaders and provides search, themes, colors, and examples, but production components do not depend on it. To import `@gromlab/svg-sprites/react`, install the package using the project's package manager.
