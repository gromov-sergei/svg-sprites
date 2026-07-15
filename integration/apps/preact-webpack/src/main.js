import { h, render } from 'preact'

import '@gromlab/svg-sprites/viewer/element'
import { IconsIcon } from './sprite/index.js'
import './style.css'

const viewerSources = [
  () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
]

function App() {
  const connectViewer = (viewer) => {
    if (viewer) viewer.sources = viewerSources
  }

  return h('main', null,
    h('h1', null, 'Preact + Webpack'),
    h(IconsIcon, {
      'data-testid': 'icon',
      'data-app': 'preact-webpack',
      icon: 'check',
      'aria-label': 'Check icon',
      width: 64,
      height: 64,
      style: { '--icon-color-1': '#16a34a' },
    }),
    h('gromlab-sprite-viewer', {
      ref: connectViewer,
      'viewer-title': 'Preact Webpack Viewer',
    }),
  )
}

render(h(App), document.getElementById('root'))
