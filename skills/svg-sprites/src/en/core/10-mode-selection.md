## Selecting a mode

Select exactly one supported mode key:

| Project | Mode key |
|---|---|
| Static HTML / custom publishing | `standalone` |
| Standalone + Vite | `standalone@vite` |
| Standalone + Webpack 5 | `standalone@webpack` |
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |

Mode may come from the config, CLI, or programmatic API. Values are applied as `defaults → config → CLI/API overrides`. A mode must exist after merging.

The CLI accepts exactly one path. A `.ts`, `.js`, or `.json` file loads that exact config regardless of its name. A directory enables config-less generation with settings supplied through CLI flags.

```json
{
  "scripts": {
    "sprite:<name>": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites <path-to-config>",
    "sprite:<name>:cli": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites --mode <mode-key> <sprite-directory>"
  }
}
```

Generation through `npx` does not add the package to the project. Pin an exact package version instead of `latest` in CI. Do not use incomplete `react`, `next@app`, `next@pages`, or `standalone@` keys, or the removed `legacy` mode. Use bare `standalone` only when the application publishes the SVG itself; use the complete Vite/Webpack key otherwise. Create one command per config file or directory when the project has multiple sprites.
