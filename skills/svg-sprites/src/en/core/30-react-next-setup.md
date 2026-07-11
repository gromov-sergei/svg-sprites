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

Install the package as a development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Use the configuration helper for autocomplete and type checking:

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'File manager icons',
  inputFolder: './icons',
  inputFiles: ['../../shared/icons/close.svg'],
})
```

The object contract is the same for React and Next.js. Use `defineNextSpriteConfig(...)` instead for a Next.js sprite.

`name` must begin with an ASCII letter and use kebab-case. The example `file-manager` produces `FileManagerIcon`, `FileManagerIconName`, and `fileManagerIconNames`. Another sprite gets its own names. If `name` is omitted, the generator derives it from the directory.

Add a separate command with the selected mode key and one path:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode react@vite src/ui/file-manager/svg-sprite",
    "sprites": "npm run sprite:file-manager"
  }
}
```

For Next.js, substitute the full key, for example `next@app/turbopack`. For multiple sprites, add one `sprite:<name>` command per directory and invoke them sequentially from `sprites`.

Generated files are excluded from Git by default, so run `sprites` before any process that needs `index.ts`, the types, or the asset. Add it to `predev`, `prebuild`, and, when a `typecheck` script exists, `pretypecheck`.

If a lifecycle script is missing, create it. If it already exists, preserve its command and append generation with `&&`; for example, change `"prebuild": "npm run lint"` to `"prebuild": "npm run lint && npm run sprites"`. Never replace an existing `pre*` script with generation alone, and never create a duplicate JSON key.

Run the first generation manually:

```bash
npm run sprites
```
