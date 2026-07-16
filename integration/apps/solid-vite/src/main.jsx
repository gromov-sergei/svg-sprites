import { onMount } from 'solid-js'
import { render } from 'solid-js/web'

import { AppIcon } from './app-icons'
import { RemoteAppIcon } from './remote-app-icons'
import './style.css'

function App() {
  let viewerHost

  onMount(async () => {
    await import('@gromlab/svg-sprites/viewer/element')
    const viewer = document.createElement('gromlab-sprite-viewer')
    viewer.viewerTitle = 'Solid Vite Viewer'
    viewer.sources = [
      () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
      () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
    ]
    viewerHost.append(viewer)
  })

  return (
    <main>
      <h1>Solid + Vite</h1>
      <AppIcon
        data-testid="icon"
        data-app="solid-vite"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ color: '#16a34a', '--icon-color-1': '#16a34a' }}
      />
      <RemoteAppIcon
        data-testid="remote-icon"
        data-app="solid-vite-remote"
        icon="check"
        aria-label="Remote check icon"
        width={64}
        height={64}
        style={{ color: '#16a34a', '--icon-color-1': '#16a34a' }}
      />
      <div class="viewer" ref={viewerHost} />
    </main>
  )
}

render(() => <App />, document.getElementById('root'))
