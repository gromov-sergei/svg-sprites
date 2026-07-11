# SVG Sprites

## Purpose

Use this skill when working with `@gromlab/svg-sprites`: initial setup, adding and reusing icons, generating React components, integrating `SpriteViewer`, migrating legacy configurations, and troubleshooting errors.

Do not impose a specific directory architecture on the project. First inspect the existing `package.json`, sprite configuration, framework, router, and bundler.

## Workflow

1. Identify the existing mode and do not mix its API with another mode.
2. For React, choose `react@vite` or `react@webpack` and open the corresponding reference.
3. For Next.js, identify the App Router or Pages Router, then Turbopack or Webpack, and open the corresponding reference.
4. For an existing `svg-sprites.config.ts` with multiple sprites, use the legacy documentation. Do not migrate such a project unless explicitly requested.
5. Inspect local scripts and run generation before `dev`, `build`, and `typecheck` when generated files are not committed to Git.
6. After changing a configuration or SVG file, run generation followed by the available type check or project build.

## React And Next.js Rules

- Use a local `svg-sprite.config.ts` and the appropriate config helper: `defineReactSpriteConfig` or `defineNextSpriteConfig`.
- Do not manually edit `generated/`, `index.ts`, `manifest.ts`, or the generator-created `.gitignore`.
- Source SVG names become valid values for the `icon` prop; use the generated component and its public types instead of deep imports.
- Combine the local folder with `inputFiles` when multiple sprites need a shared icon. Do not create unnecessary copies of the same SVG.
- In Next.js, generated components work in Server Components, SSR, and SSG. Do not add `'use client'` only for an icon.
- Keep the sprite as an external bundler asset: do not move SVG path data into JavaScript or manually place the generated file in `public`.

## Colors And Transformations

- By default, the generator removes `width` and `height`, replaces supported `fill` and `stroke` values with CSS variables, and adds transitions.
- For a monochrome icon, control `color` first; for a multicolor icon, use `--icon-color-N`.
- Do not promise automatic color replacement inside external stylesheets, gradients, patterns, filters, or `url(#...)` values without checking the result.
- Page CSS variables work with `<svg><use>`, but do not propagate into `<img>` or `background-image`.

## Preview

For React and Next.js, add `<SpriteViewer>` as a separate debug page in the application. Pass sprite manifests or lazy loaders to it. The Viewer supports search, light and dark themes, color controls, and React, SVG, IMG, and CSS examples.

`SpriteViewer` is a client-side debug tool imported from `@gromlab/svg-sprites/react`; production icon components do not depend on it.

## Troubleshooting

- If an icon name is missing from autocomplete, check the input folder and `inputFiles`, then rerun generation.
- If two files have the same icon name, resolve the conflict instead of implicitly selecting one file.
- If the generator refuses to overwrite a file, do not remove the protection marker or bypass the writer: move the user file or choose another sprite directory.
- If an asset fails to load, first confirm that the CLI mode matches the project's actual bundler and that its asset pipeline handles the generated SVG.
- If the project uses the old API, check the installed package version and the legacy reference before making changes.

## References

- [Main documentation and API](./references/README.md)
- [React + Vite](./references/docs/en/react-vite.md)
- [React + Webpack 5](./references/docs/en/react-webpack.md)
- [Next.js App Router](./references/docs/en/next-app.md)
- [Next.js Pages Router](./references/docs/en/next-pages.md)
- [Legacy mode](./references/docs/en/legacy.md)
- [Migrating from 0.1.x](./references/docs/en/migration-1.md)
- [Programmatic API](./references/docs/en/programmatic-api.md)
