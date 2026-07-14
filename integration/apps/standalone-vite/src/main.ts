import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'
import { getIconsIconHref, iconsSpriteUrl } from './sprite'
import './style.css'

const check = spriteManifest.icons.find((icon) => icon.name === 'check')
if (!check || spriteManifest.spriteUrl !== iconsSpriteUrl) {
  throw new Error('Generated Vite facade and manifest disagree.')
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Standalone + Vite</h1>
  <svg
    data-testid="icon"
    data-app="standalone-vite"
    viewBox="${check.viewBox ?? '0 0 24 24'}"
    aria-label="Check icon"
  >
    <use href="${getIconsIconHref('check')}"></use>
  </svg>
  <gromlab-sprite-viewer></gromlab-sprite-viewer>
`

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.viewerTitle = 'Standalone Vite Viewer'
viewer.sources = [spriteManifest]
