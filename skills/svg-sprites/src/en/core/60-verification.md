## Verifying the result

After changing a config or SVG, perform these required quick checks:

1. Run the exact sprite command, for example `npm run sprite:file-manager`; it must exit with code `0` and report the name, icon count, mode, and `generated` directory.
2. Confirm that `index.ts`, `manifest.ts`, `generated/sprite.svg`, `generated/react-component.tsx`, `generated/types.ts`, `generated/styles.module.css`, and `generated/.svg-sprites.manifest.json` exist.
3. Confirm that the new icon appears in the readonly name array and is accepted by the `icon` prop.
4. Run the project's existing type check, for example `npm run typecheck` or `npx tsc --noEmit`.
5. Check that `target` in `manifest.ts` matches the selected mode key; the generated asset expression must use `?no-inline` for Vite and `new URL(...)` for Webpack/Next.

Do not run a full production build solely to verify a changed icon list. It is required when the bundler target, asset pipeline configuration, Next router/bundler, or Webpack loader changed, or when diagnosing a runtime URL failure.

Perform visual, Network, and accessibility-tree checks only when a running application and browser tools are available. If those tools are unavailable, do not claim that colors, themes, accessibility, or the asset's HTTP response were verified; explicitly state what remains unchecked.

`SpriteViewer` is also optional. Use it for complex colors, transforms, and broad visual checks, but do not add a debug route just to generate a routine single sprite.
