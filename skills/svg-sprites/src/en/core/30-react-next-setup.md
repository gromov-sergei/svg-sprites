## Setting up React or Next.js

Choose a target directory for one sprite. It may live next to a feature, in a shared icons directory, or anywhere else that follows the project's conventions. The following structure is only an example:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

One `svg-sprite.config.ts` creates one independent sprite. For multiple sets, choose multiple directories and assign each a unique `name`.

The generator does not need to be installed in the project. Start with a plain
config that has no package import:

```ts
export default {
  mode: 'react@vite',
  name: 'file-manager',
  description: 'File manager icons',
  input: ['./icons', '../../shared/icons/close.svg'],
}
```

`input` accepts one folder, exact SVG file, or glob, or an array that combines them. Prefix an array item with `!` to exclude matches. Folders are shallow; use an explicit `**/*.svg` glob for recursion. Omit `input` to use `./icons`. Every path is resolved from the config directory, and every positive source must match at least one SVG.

The object contract is the same for React and Next.js; only the full `mode` differs. Install the package only for the optional Viewer, programmatic API, or package-provided config typing. Exact guides also provide a local copy-paste config type for projects that remain package-free.

`name` must begin with an ASCII letter and use kebab-case. The example `file-manager` produces `FileManagerIcon`, `FileManagerIconName`, and `fileManagerIconNames`. Another sprite gets its own names. If `name` is omitted, the generator derives it from the directory.

Add a separate command with the selected mode key and one path:

```json
{
  "scripts": {
    "sprite:file-manager": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "sprites": "npm run sprite:file-manager"
  }
}
```

For Next.js, set the full key in the config, for example `next@app/turbopack`. For multiple sprites, add one `sprite:<name>` command per config file and invoke them sequentially from `sprites`.

To select sources from the CLI instead, repeat `--input <path-or-glob>`; the values form the same array contract, including `!` exclusions:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts \
  --input ./icons \
  --input '../../shared/icons/**/*.svg' \
  --input '!../../shared/icons/legacy-*.svg'
```

Generated files in `.svg-sprite` are excluded from Git by default, so run `sprites` before any process that needs the component, types, or asset. If the project imports the sprite-module root, create a user-owned `index.ts` with `export * from './.svg-sprite'`. Generated declarations are self-contained and do not import the generator package.

Run generation either from `predev`/`prebuild`/`pretypecheck` hooks or explicitly inside the corresponding commands. Do not use both forms for the same command, or generation runs twice. Preserve existing script commands and never create a duplicate JSON key.

Run the first generation manually:

```bash
npm run sprites
```
