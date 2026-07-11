## Inspecting the project

Establish the project's actual contract before making changes:

1. Read the root `package.json`, lockfile, and workspace configuration; identify the framework, bundler, and existing commands.
2. Find `svg-sprite.config.ts`, `svg-sprites.config.ts`, commands containing `svg-sprites`, and imports of generated components.
3. For React, determine whether the project uses Vite or Webpack 5 from its scripts and configuration. For Next.js, separately determine the App/Pages Router and the bundler used by the actual `dev`/`build` commands.
4. Check existing `predev`, `prebuild`, `pretypecheck`, and orchestration scripts. Do not overwrite them.
5. For a new sprite, choose a target directory without imposing a particular application layer or architecture.
6. Check TypeScript and alias settings. Package subpath exports require TypeScript 5+ with `moduleResolution: 'bundler'`, `'node16'`, or `'nodenext'`.

All paths in a modern config are relative to the directory containing `svg-sprite.config.ts`:

- `inputFolder` defaults to `./icons`;
- `inputFiles` contains additional relative paths to individual SVGs and is merged with `inputFolder`;
- the same absolute file is deduplicated, but different files with the same icon basename cause an error;
- scanning `inputFolder` is shallow: only immediate files ending in `.svg` are read, and nested directories are not traversed;
- an explicitly configured `inputFolder` that does not exist is an error;
- if `inputFolder` is omitted, `./icons` does not exist, and `inputFiles` is non-empty, generation uses only `inputFiles`;
- an empty final input set, a missing file, or a path that does not point to an `.svg` file is an error.

Do not copy a shared SVG into several folders: add its relative path to `inputFiles` in every sprite that needs it. If a recursive structure is required, list the files explicitly or reorganize the sources; the generator does not perform recursive scanning.
