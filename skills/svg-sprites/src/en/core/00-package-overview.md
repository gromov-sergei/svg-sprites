## What the package does

`@gromlab/svg-sprites` is a CLI generator that builds SVG sprites from user-provided SVG files. The package does not include its own icon set: it compiles the project's SVGs into an external cacheable sprite asset and, for React/Next.js, creates a typed component, a list of valid names, and a debug manifest.

The package supports multiple independent sprites in one project. Each explicitly selected config file or config-less directory describes one sprite and gets its own:

- SVG asset;
- icon name types;
- React component;
- production entry point `.svg-sprite/index.js` with `.d.ts`;
- debug entry point `.svg-sprite/svg-sprite.manifest.js` with `.d.ts`.

The project determines how many sprite directories exist and where they live. For example, `name: 'file-manager'` produces `FileManagerIcon`, while another directory with `name: 'navigation'` produces a separate `NavigationIcon`. The names `FileManagerIcon` and `fileManagerIconNames` used below are examples of the API for one possible sprite, not fixed package exports.

Generated production components do not import `@gromlab/svg-sprites` at runtime. Install the package as a development dependency so configuration helpers and the local CLI use the version recorded in the project's lockfile.
