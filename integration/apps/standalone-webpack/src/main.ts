import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'
import { defineIconsIconElement, iconsSpriteUrl } from './sprite'

const check = spriteManifest.icons.find((icon) => icon.name === 'check')
if (!check || spriteManifest.spriteUrl !== iconsSpriteUrl) {
  throw new Error('Generated Webpack facade and manifest disagree.')
}

defineIconsIconElement()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Standalone + Webpack</h1>
  <icons-icon
    data-testid="icon"
    data-app="standalone-webpack"
    icon="check"
    role="img"
    aria-label="Check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  ></icons-icon>
  <gromlab-sprite-viewer></gromlab-sprite-viewer>
`

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.viewerTitle = 'Standalone Webpack Viewer'
viewer.sources = [spriteManifest]
