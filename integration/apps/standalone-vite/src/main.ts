import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'
import { defineIconsIconElement, iconsSpriteUrl } from './sprite'
import './style.css'

const check = spriteManifest.icons.find((icon) => icon.name === 'check')
if (!check || spriteManifest.spriteUrl !== iconsSpriteUrl) {
  throw new Error('Generated Vite facade and manifest disagree.')
}

defineIconsIconElement()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Standalone + Vite</h1>
  <icons-icon
    data-testid="icon"
    data-app="standalone-vite"
    icon="check"
    role="img"
    aria-label="Check icon"
  ></icons-icon>
  <gromlab-sprite-viewer></gromlab-sprite-viewer>
`

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.viewerTitle = 'Standalone Vite Viewer'
viewer.sources = [spriteManifest]
