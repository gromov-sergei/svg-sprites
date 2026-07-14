## What the package does

`@gromlab/svg-sprites` is a CLI generator that builds SVG sprites from user-provided SVG files. The package does not include its own icon set: it compiles the project's SVGs into an external sprite asset, creates a native typed Web Component for standalone bundler modes, and creates a React component for React/Next.js.

The package supports multiple independent sprites in one project. Each explicitly selected config file or config-less directory describes one sprite and gets its own:

- SVG asset;
- mode-specific manifest data;
- icon name types and `.svg-sprite/index.js` for bundler modes;
- a native Web Component with an explicit registration function for `standalone@vite`/`standalone@webpack`;
- a React component only for React/Next.js;
- a deployment-neutral JSON manifest without a public URL for bare `standalone`.

The project determines how many sprite directories exist and where they live. For example, `name: 'file-manager'` produces `FileManagerIcon`, while another directory with `name: 'navigation'` produces a separate `NavigationIcon`. The names `FileManagerIcon` and `fileManagerIconNames` used below are examples of the API for one possible sprite, not fixed package exports.

Generated production runtime and declarations do not import `@gromlab/svg-sprites`. Generation can run through a pinned `npx --package` command without adding the package to the project. Install it as a development dependency only for the Viewer, package-provided config types, or the programmatic API.
