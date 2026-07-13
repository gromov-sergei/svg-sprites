## Diagnostics

Match the symptom to the relevant check and fix the root cause:

| Symptom | Likely cause | Action |
|---|---|---|
| `Missing sprite config file or module directory` | The positional path is missing | Pass one config file or a directory for config-less generation. |
| `Expected one config file or module directory` | Multiple paths were passed | Create one command per sprite and combine the scripts. |
| `Sprite mode is required` | Mode is absent from both config and CLI | Add `mode` to the object or pass the full `--mode`. |
| `Unsupported sprite config extension` | The supplied file is not `.ts`, `.js`, or `.json` | Use a supported config format. |
| `Input directory does not exist` | The relative path is wrong or an explicitly configured folder is missing | Resolve it from the config directory; create the folder or correct `inputFolder`. |
| Icons from a subdirectory are missing | Recursive scanning was assumed | Move the SVG to the top level of `inputFolder` or list it in `inputFiles`. |
| `SVG file does not exist`, `File is not an SVG`, or an empty input set | Invalid `inputFiles`, extension, or sources | Correct the path/extension and provide at least one input SVG. |
| Icon name or SVG ID collision | Two different files have the same basename, or a hash ID collides with a name | Rename one source SVG; do not select a file implicitly. |
| `Refusing to overwrite/delete a user file` | A user file occupies a managed path or lost its marker | Do not bypass the protection: move the file or choose another sprite directory and regenerate. |
| Missing `.svg-sprite/index.js` or name absent from autocomplete | Generation did not run, the user barrel does not export `.svg-sprite`, or the type server cached an old module | Run the sprite command, check `export * from './.svg-sprite'`, then typecheck; restart the TypeScript server if necessary. |
| SVG does not load or the URL is wrong | Mode and bundler differ, Webpack `publicPath` is wrong, or a custom loader intercepted the asset | Align mode with the build command, check Asset Modules/`publicPath`, and exclude the generated SVG from the incompatible loader. |
| Next build differs between SSR and browser | The module targets another bundler/router, or the URL was rewritten manually | Restore the generated `new URL(...)`, select the exact Next mode, and regenerate. |
| `color` does not change a multicolor icon | The icon uses several variables or is rendered through `<img>`/CSS background | Use `<FileManagerIcon>`/`<svg><use>` and the required `--icon-color-N` properties. |
| Gradient/filter renders incorrectly | Automatic color replacement cannot guarantee complex paint servers | Inspect the generated SVG; disable `replaceColors` for the sprite or simplify the source if necessary. |
| Viewer is empty | Manifests were not generated, the glob/import is not static, or the Client Component boundary is wrong | Generate sprites first; use a literal glob for Vite, static loaders for Webpack/Next, and add `'use client'` only to the App Router Viewer page. |

For an unknown error, record the complete CLI command, mode, config-file or directory path, and first stack/error message. Then reduce it to one sprite without deleting user files or protective markers.
