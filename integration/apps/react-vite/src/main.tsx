import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpriteViewer } from '@gromlab/svg-sprites/react'

import { AppIcon } from './app-icons'
import { RemoteAppIcon } from './remote-app-icons'
import './style.css'

const viewerSources = [
  () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
  () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
] as const

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <h1>React + Vite</h1>
      <AppIcon
        data-testid="icon"
        data-app="react-vite"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <RemoteAppIcon
        data-testid="remote-icon"
        data-app="react-vite-remote"
        icon="check"
        aria-label="Remote check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <SpriteViewer sources={viewerSources} title="React Vite Viewer" style={{ marginTop: 32 }} />
    </main>
  </StrictMode>,
)
