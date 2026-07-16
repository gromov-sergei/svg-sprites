<script>
  import '@gromlab/svg-sprites/viewer/element'

  import { AppIcon } from './app-icons/index.js'
  import { RemoteAppIcon } from './remote-app-icons/index.js'

  const viewerSources = [
    () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
    () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
  ]

  /** @param {HTMLElement & { sources: unknown }} node */
  function connectViewer(node) {
    node.sources = viewerSources
  }
</script>

<main>
  <h1>Svelte + Vite</h1>
  <AppIcon
    data-testid="icon"
    data-app="svelte-vite"
    icon="check"
    aria-label="Check icon"
    width="64"
    height="64"
    style="--icon-color-1: #16a34a"
  />
  <RemoteAppIcon
    data-testid="remote-icon"
    data-app="svelte-vite-remote"
    icon="check"
    aria-label="Remote check icon"
    width="64"
    height="64"
    style="--icon-color-1: #16a34a"
  />
  <gromlab-sprite-viewer
    use:connectViewer
    viewer-title="Svelte Vite Viewer"
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
