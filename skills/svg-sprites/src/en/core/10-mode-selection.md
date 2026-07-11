## Selecting a mode

Select exactly one supported mode key:

| Project | Mode key |
|---|---|
| React + Vite | `react@vite` |
| React + Webpack 5 | `react@webpack` |
| Next.js App Router + Turbopack | `next@app/turbopack` |
| Next.js App Router + Webpack 5 | `next@app/webpack` |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` |
| Next.js Pages Router + Webpack 5 | `next@pages/webpack` |
| Existing shared config | `legacy` |

Do not use the incomplete `react`, `next@app`, or `next@pages` keys, the future `standalone` mode, or a mode for a different bundler. The CLI always requires a mode and exactly one path to a configuration directory:

```bash
npx --yes @gromlab/svg-sprites@latest --mode <mode-key> <sprite-directory>
```

Do not pass multiple paths, a glob, or the path to the config file itself. For multiple modern sprites, create a separate command for each directory.

Identify legacy mode by its contract, not by the number of sprites:

- `svg-sprites.config.ts` in the supplied root, with top-level `output` and a non-empty `sprites` array, is a legacy config even if it contains only one entry;
- each legacy entry uses `name`, `input`, and optional `format: 'stack' | 'symbol'`; the `mode` field is deprecated;
- a local `svg-sprite.config.ts` in a single sprite directory, with `name`, `description`, `inputFolder`, `inputFiles`, `transform`, and `generatedNotice`, belongs to the React/Next API even when the application has many such sprites.

Do not migrate a legacy config without an explicit request. Do not combine `defineLegacyConfig` or the `output`/`sprites` fields with `defineReactSpriteConfig` or `defineNextSpriteConfig`.
