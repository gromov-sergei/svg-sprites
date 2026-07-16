<script>
  import { AppIcon } from '../app-icons/index.js'
  import { RemoteAppIcon } from '../remote-app-icons/index.js'

  const viewerSources = [
    () => import('../app-icons/.svg-sprite/svg-sprite.manifest.js'),
    () => import('../remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
  ]

  /** @param {HTMLElement & { sources: unknown; viewerTitle: string }} node */
  function connectViewer(node) {
    let connected = true
    void import('@gromlab/svg-sprites/viewer/element').then(() => {
      if (!connected) return
      node.sources = viewerSources
      node.viewerTitle = 'SvelteKit Vite Viewer'
    })

    return {
      destroy() {
        connected = false
      },
    }
  }
</script>

<svelte:head>
  <title>SvelteKit sprite fixture</title>
</svelte:head>

<main>
  <h1>SvelteKit</h1>
  <AppIcon
    data-testid="icon"
    data-app="sveltekit"
    icon="check"
    aria-label="Check icon"
    width="64"
    height="64"
    style="--icon-color-1: #16a34a"
  />
  <RemoteAppIcon
    data-testid="remote-icon"
    data-app="sveltekit-remote"
    icon="check"
    aria-label="Remote check icon"
    width="64"
    height="64"
    style="--icon-color-1: #16a34a"
  />
  <gromlab-sprite-viewer use:connectViewer></gromlab-sprite-viewer>
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
