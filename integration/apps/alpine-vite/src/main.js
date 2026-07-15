import '@gromlab/svg-sprites/viewer/element'
import Alpine from 'alpinejs'
import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'
import { iconsAlpinePlugin } from './sprite/index.js'

Alpine.plugin(iconsAlpinePlugin)
window.Alpine = Alpine

document.querySelector('#app').innerHTML = `
  <main x-data>
    <h1>Alpine + Vite</h1>
    <svg
      data-testid="icon"
      data-app="alpine-vite"
      x-icons-icon="'check'"
      role="img"
      aria-label="Check icon"
      style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
    ></svg>
    <gromlab-sprite-viewer viewer-title="Alpine Vite Viewer"></gromlab-sprite-viewer>
  </main>
`

document.querySelector('gromlab-sprite-viewer').sources = [spriteManifest]
Alpine.start()
