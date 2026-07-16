import { h, render } from 'preact'

import '@gromlab/svg-sprites/viewer/element'
import { AppIcon } from './app-icons/index.js'
import { RemoteAppIcon } from './remote-app-icons/index.js'
import './style.css'

const viewerSources = [
  () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
  () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
]

function App() {
  const connectViewer = (viewer) => {
    if (viewer) viewer.sources = viewerSources
  }

  return h('main', null,
    h('h1', null, 'Preact + Vite'),
    h(AppIcon, {
      'data-testid': 'icon',
      'data-app': 'preact-vite',
      icon: 'check',
      'aria-label': 'Check icon',
      width: 64,
      height: 64,
      style: { '--icon-color-1': '#16a34a' },
    }),
    h(RemoteAppIcon, {
      'data-testid': 'remote-icon',
      'data-app': 'preact-vite-remote',
      icon: 'check',
      'aria-label': 'Remote check icon',
      width: 64,
      height: 64,
      style: { '--icon-color-1': '#16a34a' },
    }),
    h('gromlab-sprite-viewer', {
      ref: connectViewer,
      'viewer-title': 'Preact Vite Viewer',
    }),
  )
}

render(h(App), document.getElementById('root'))
