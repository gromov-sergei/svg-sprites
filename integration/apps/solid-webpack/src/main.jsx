import { onMount } from 'solid-js'
import { render } from 'solid-js/web'

import '@gromlab/svg-sprites/viewer/element'
import { IconsIcon } from './sprite/index.js'
import './style.css'

const viewerSources = [
  () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
]

function App() {
  let viewer

  onMount(() => {
    viewer.sources = viewerSources
  })

  return (
    <main>
      <h1>Solid + Webpack</h1>
      <IconsIcon
        data-testid="icon"
        data-app="solid-webpack"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <gromlab-sprite-viewer ref={viewer} viewer-title="Solid Webpack Viewer" />
    </main>
  )
}

render(() => <App />, document.getElementById('root'))
