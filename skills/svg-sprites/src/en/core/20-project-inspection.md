## Inspecting the project

Establish the project's actual contract before making changes:

1. Read the root `package.json`, lockfile, and workspace configuration; identify the framework, bundler, and existing commands.
2. Find config files, commands containing `svg-sprites`, and imports of generated components. Config names are arbitrary; use the explicit CLI path and object fields.
3. For React, determine whether the project uses Vite or Webpack 5 from its scripts and configuration. For Next.js, separately determine the App/Pages Router and the bundler used by the actual `dev`/`build` commands.
4. Check existing `predev`, `prebuild`, `pretypecheck`, and orchestration scripts. Do not overwrite them.
5. For a new sprite, choose a target directory without imposing a particular application layer or architecture.
6. Check TypeScript and alias settings. Package subpath exports require TypeScript 5+ with `moduleResolution: 'bundler'`, `'node16'`, or `'nodenext'`.

All input paths are relative to the directory containing the explicitly selected config file; in config-less mode they are relative to the supplied directory. Inspect `input` using this single contract:

- `input?: string | string[]` defaults to `./icons`;
- each string is a folder, an exact SVG file, or a glob;
- a folder is scanned shallowly; nested files are included only by an explicit recursive glob such as `./icons/**/*.svg`;
- an array combines positive sources, while an item prefixed with `!` excludes its matches from the combined set;
- every positive source must resolve to at least one SVG, so a missing or empty folder, an unmatched glob, a missing file, or a non-SVG exact file is an error;
- resolved files are deduplicated and sorted deterministically;
- different files with the same basename are a conflict, even when they came from different sources.

Do not copy a shared SVG into several folders: add its exact path or a suitable glob to `input` in every sprite that needs it. Use `**/*.svg` only when recursive inclusion is intentional.
