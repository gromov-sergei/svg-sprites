## Generated directory contract

After generation, the selected directory has this structure:

```text
svg-sprite/
├── icons/                              # user-owned sources
├── svg-sprite.config.ts                # user-owned config
├── .gitignore                          # managed by the generator
├── index.ts                            # public production entry point
├── manifest.ts                         # separate debug entry point
└── generated/
    ├── .svg-sprites.manifest.json      # ownership registry
    ├── react-component.tsx
    ├── sprite.svg
    ├── styles.module.css
    └── types.ts
```

Edit only the source SVGs and `svg-sprite.config.ts`. Do not manually change `.gitignore`, `index.ts`, `manifest.ts`, or anything in `generated/`: the next generation will overwrite them. Import the production API from the root `index.ts`, not through a deep import from `generated/`.

The generator owns only the listed root files and immediate files in `generated/`. The `.svg-sprites.manifest.json` registry allows stale generated files to be removed, but the writer refuses to overwrite or delete any file without a generated marker. Do not remove the marker, bypass the refusal, or replace generated paths with symlinks: move the user-owned file or choose a different directory.

The public entry point exports the component, props/style types, a readonly array of names, and the icon-name union type. `manifest.ts` contains the URL, target, icon list, and icon metadata for debug tools and is not imported by the production component.

The sprite remains a separate content-hashed asset; SVG path data is not embedded in JavaScript:

- `react@vite` generates a static `sprite.svg?no-inline` import, preventing Vite from inlining it;
- React Webpack 5 and all Next modes generate `new URL('./sprite.svg', import.meta.url).href`, which must be processed by the selected bundler's Asset Modules;
- a custom Webpack SVG loader must not intercept the generated `sprite.svg`;
- in Next mode, the generated component does not contain `'use client'` and works in Server Components, SSR, and SSG; do not add a client boundary solely for an icon;
- the Next build command and mode key must agree: Turbopack with `.../turbopack`, Webpack with `.../webpack`.

Do not move the generated sprite into `public` or rewrite its URL manually. When changing the router or bundler, regenerate the sprite with the new full mode key.
