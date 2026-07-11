## Diagnostics

Match the symptom to the relevant check and fix the root cause:

| Symptom | Likely cause | Action |
|---|---|---|
| `Missing required argument: --mode` or `Missing sprite path` | Incomplete CLI command | Pass `--mode <full-key>` and one sprite directory. |
| `Expected one sprite path` | Multiple paths were passed | Create one command per modern sprite and combine the scripts. |
| `React mode requires a target` or `Unsupported Next.js target` | A shortened or unsupported key was used | Select one of the seven mode keys from the table; do not use `standalone`. |
| `React config file not found` | The CLI path does not point to a directory containing `svg-sprite.config.ts` | Fix the positional path; do not pass the config file itself. |
| Legacy config is missing or read by the wrong pipeline | `svg-sprites.config.ts` and `svg-sprite.config.ts` were confused | Identify the API by the config filename and fields, regardless of the number of `sprites` entries. |
| `Input directory does not exist` | The relative path is wrong or an explicitly configured folder is missing | Resolve it from the config directory; create the folder or correct `inputFolder`. |
| Icons from a subdirectory are missing | Recursive scanning was assumed | Move the SVG to the top level of `inputFolder` or list it in `inputFiles`. |
| `SVG file does not exist`, `File is not an SVG`, or an empty input set | Invalid `inputFiles`, extension, or sources | Correct the path/extension and provide at least one input SVG. |
| Icon name or SVG ID collision | Two different files have the same basename, or a hash ID collides with a name | Rename one source SVG; do not select a file implicitly. |
| `Refusing to overwrite/delete a user file` | A user file occupies a managed path or lost its marker | Do not bypass the protection: move the file or choose another sprite directory and regenerate. |
| Missing `index.ts` or name absent from autocomplete | Generation did not run after the change, or the type server cached an old module | Run the sprite command, then typecheck; restart the TypeScript server if necessary. |
| SVG does not load or the URL is wrong | Mode and bundler differ, Webpack `publicPath` is wrong, or a custom loader intercepted the asset | Align mode with the build command, check Asset Modules/`publicPath`, and exclude the generated SVG from the incompatible loader. |
| Next build differs between SSR and browser | The module targets another bundler/router, or the URL was rewritten manually | Restore the generated `new URL(...)`, select the exact Next mode, and regenerate. |
| `color` does not change a multicolor icon | The icon uses several variables or is rendered through `<img>`/CSS background | Use `<FileManagerIcon>`/`<svg><use>` and the required `--icon-color-N` properties. |
| Gradient/filter renders incorrectly | Automatic color replacement cannot guarantee complex paint servers | Inspect the generated SVG; disable `replaceColors` for the sprite or simplify the source if necessary. |
| Viewer is empty | Manifests were not generated, the glob/import is not static, or the Client Component boundary is wrong | Generate sprites first; use a literal glob for Vite, static loaders for Webpack/Next, and add `'use client'` only to the App Router Viewer page. |

For an unknown error, record the complete CLI command, mode, config path, and first stack/error message. Then reduce it to one sprite without deleting user files or protective markers.
