## Generated directory contract

After generation, a React/Next directory has this structure:

```text
svg-sprite/
├── icons/                              # user-owned sources
├── svg-sprite.config.ts                # recommended config name
├── index.ts                            # optional user-owned barrel
├── .gitignore                          # managed by the generator
└── .svg-sprite/
    ├── state.json                      # ownership registry and contract version
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
generate `index.*`, `icon-data.*`, and a resolved manifest.

Edit the source SVGs, selected config, and user-owned `index.ts`. Do not manually change `.gitignore` or anything in `.svg-sprite`: the next generation will overwrite them. To import from the sprite-module root, create a barrel:

```ts
export * from './.svg-sprite'
```

The generator owns `.gitignore` and files inside `.svg-sprite`. The `state.json` registry allows stale generated files to be removed, but the writer refuses to overwrite or delete any file without a generated marker. Do not remove the marker, bypass the refusal, or replace generated paths with symlinks: move the user-owned file or choose a different directory.

The internal `index.js` exports the component from `react/react-component.js` and the readonly name array; the adjacent `index.d.ts` adds props/style types and the icon-name union. The manifest contains the mode, URL, target, icon list, and icon metadata for debug tools and is not imported by the production component.

The sprite remains a separate content-hashed asset; SVG path data is not embedded in JavaScript:

- `react@vite` generates a static `sprite.svg?no-inline` import, preventing Vite from inlining it;
- `standalone@vite` uses the same Vite asset mechanism but exports an href helper without React;
- `standalone@webpack` uses Webpack Asset Modules without React;
- React Webpack 5 and all Next modes generate `new URL('./sprite.svg', import.meta.url).href`, which must be processed by the selected bundler's Asset Modules;
- a custom Webpack SVG loader must not intercept the generated `sprite.svg`;
- in Next mode, the generated component does not contain `'use client'` and works in Server Components, SSR, and SSG; do not add a client boundary solely for an icon;
- the Next build command and mode key must agree: Turbopack with `.../turbopack`, Webpack with `.../webpack`.

For bundler modes, do not move the generated sprite into `public` or rewrite its URL manually. For bare `standalone`, do not move the managed original: the application may explicitly copy it into deploy output and owns the public URL and stale-copy cleanup. Regenerate with the new complete key when changing mode.
