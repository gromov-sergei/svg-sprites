## Generated directory contract

After generation, a React/Next directory has this structure:

```text
svg-sprite/
├── icons/                              # user-owned sources
├── svg-sprite.config.ts                # recommended config name
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

Standalone does not create `react/`. Bare `standalone` generates `sprite.svg` and
`svg-sprite.manifest.json`; `standalone@vite`/`standalone@webpack` additionally
generate `index.*`, `icon-data.*`, and a resolved manifest. Their `index.*` also
contains a native generated Web Component; bare `standalone` gets no JavaScript runtime
and does not create or modify `.gitignore`.

Edit the source SVGs, selected config, and user-owned `index.ts`. Do not manually change anything in `.svg-sprite`: the next generation will overwrite it. In modes other than bare `standalone`, the generated `.gitignore` is also managed and must not be edited manually. To import from the sprite-module root, create a barrel:

```ts
export * from './.svg-sprite'
```

The generator owns the complete `.svg-sprite` directory and replaces it on every run. Never put user files inside it. The generator also owns `.gitignore` when the selected mode creates it; bare `standalone` leaves an existing `.gitignore` untouched. Generated paths must not contain symlinks.

The internal `index.js` exports the component from `react/react-component.js` and the readonly name array; the adjacent `index.d.ts` adds props/style types and the icon-name union. Bundler-mode manifest declarations define their types locally and do not import the generator package. The manifest contains the mode, URL, target, icon list, and icon metadata for debug tools and is not imported by the production component.

The sprite remains a separate content-hashed asset; SVG path data is not embedded in JavaScript:

- `react@vite` generates a static `sprite.svg?no-inline` import, preventing Vite from inlining it;
- `standalone@vite` uses the same Vite asset mechanism and exports an href helper plus a native Web Component without React;
- `standalone@webpack` uses Webpack Asset Modules and exports the same mode-local Web Component without React;
- React Webpack 5 and all Next modes generate `new URL('./sprite.svg', import.meta.url).href`, which must be processed by the selected bundler's Asset Modules;
- a custom Webpack SVG loader must not intercept the generated `sprite.svg`;
- in Next mode, the generated component does not contain `'use client'` and works in Server Components, SSR, and SSG; do not add a client boundary solely for an icon;
- the Next build command and mode key must agree: Turbopack with `.../turbopack`, Webpack with `.../webpack`.

For bundler modes, do not move the generated sprite into `public` or rewrite its URL manually. For bare `standalone`, do not move the managed original: the application may explicitly copy it into deploy output and owns the public URL and stale-copy cleanup. Regenerate with the new complete key when changing mode.
