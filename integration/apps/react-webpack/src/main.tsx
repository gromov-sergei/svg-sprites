import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpriteViewer } from '@gromlab/svg-sprites/react'

import { IconsIcon } from './sprite'
import './style.css'

const viewerSources = [
  () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <h1>React + Webpack</h1>
      <IconsIcon
        data-testid="icon"
        data-app="react-webpack"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <SpriteViewer sources={viewerSources} title="React Webpack Viewer" style={{ marginTop: 32 }} />
    </main>
  </StrictMode>,
)
