# Documentation

Choose one exact mode guide for setup. The guides are standalone documents and
can also be used unchanged by AI skills.

The common format for JSON, JavaScript, and TypeScript config files is described in the [configuration guide](configuration.md).

## Quick Start Guides

| Project | Exact mode | Guide |
|---|---|---|
| Static HTML or custom publishing | `standalone` | [Bare standalone](guides/standalone.md) |
| Vanilla + Vite | `standalone@vite` | [Standalone + Vite](guides/standalone-vite.md) |
| Vanilla + Webpack 5 | `standalone@webpack` | [Standalone + Webpack](guides/standalone-webpack.md) |
| React + Vite | `react@vite` | [React + Vite](guides/react-vite.md) |
| React + Webpack 5 | `react@webpack` | [React + Webpack](guides/react-webpack.md) |
| Next.js App Router + Turbopack | `next@app/turbopack` | [App Router + Turbopack](guides/next-app-turbopack.md) |
| Next.js App Router + Webpack | `next@app/webpack` | [App Router + Webpack](guides/next-app-webpack.md) |
| Next.js Pages Router + Turbopack | `next@pages/turbopack` | [Pages Router + Turbopack](guides/next-pages-turbopack.md) |
| Next.js Pages Router + Webpack | `next@pages/webpack` | [Pages Router + Webpack](guides/next-pages-webpack.md) |

Every guide follows the same order:

1. Generate the sprite through `npx` without adding the package to the project.
2. Use the sprite in the application.
3. Optionally add the Viewer for debugging and previews.

## Reference

- [Configuration](configuration.md)
- [Technical reference](reference/technical.md)
- [Programmatic API](reference/programmatic-api.md)
