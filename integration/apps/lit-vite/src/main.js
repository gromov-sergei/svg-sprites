import '@gromlab/svg-sprites/viewer/element'
import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'
import { defineIconsIcon } from './sprite/index.js'

defineIconsIcon()

document.querySelector('#app').innerHTML = `
  <h1>Lit + Vite</h1>
  <icons-icon
    data-testid="icon"
    data-app="lit-vite"
    icon="check"
    role="img"
    aria-label="Check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  ></icons-icon>
  <gromlab-sprite-viewer viewer-title="Lit Vite Viewer"></gromlab-sprite-viewer>
`

document.querySelector('gromlab-sprite-viewer').sources = [spriteManifest]
