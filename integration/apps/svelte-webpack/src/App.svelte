<script>
  import '@gromlab/svg-sprites/viewer/element'

  import { IconsIcon } from './sprite/index.js'

  const viewerSources = [
    () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
  ]

  /** @param {HTMLElement & { sources: unknown }} node */
  function connectViewer(node) {
    node.sources = viewerSources
  }
</script>

<main>
  <h1>Svelte + Webpack</h1>
  <IconsIcon
    data-testid="icon"
    data-app="svelte-webpack"
    icon="check"
    aria-label="Check icon"
    width="64"
    height="64"
    style="--icon-color-1: #16a34a"
  />
  <gromlab-sprite-viewer
    use:connectViewer
    viewer-title="Svelte Webpack Viewer"
  ></gromlab-sprite-viewer>
</main>

<style>
  :global(:root) {
    font-family: system-ui, sans-serif;
    color: #172033;
    background: #fff;
  }

  :global(body) {
    margin: 0;
    padding: 40px;
  }

  gromlab-sprite-viewer {
    display: block;
    margin-top: 32px;
  }
</style>
