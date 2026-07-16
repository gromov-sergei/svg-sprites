import '@gromlab/svg-sprites/viewer/element'
import Alpine from 'alpinejs'
import appManifest from './app-icons/.svg-sprite/svg-sprite.manifest.js'
import { appAlpinePlugin } from './app-icons/index.js'
import remoteAppManifest from './remote-app-icons/.svg-sprite/svg-sprite.manifest.js'
import { remoteAppAlpinePlugin } from './remote-app-icons/index.js'

Alpine.plugin(appAlpinePlugin)
Alpine.plugin(remoteAppAlpinePlugin)
window.Alpine = Alpine

document.querySelector('#app').innerHTML = `
  <main x-data>
    <h1>Alpine + Vite</h1>
    <svg
      data-testid="icon"
      data-app="alpine-vite"
      x-app-icon="'check'"
      role="img"
      aria-label="Check icon"
      style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
    ></svg>
    <svg
      data-testid="remote-icon"
      data-app="alpine-vite-remote"
      x-remote-app-icon="'check'"
      role="img"
      aria-label="Remote check icon"
      style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
    ></svg>
    <gromlab-sprite-viewer viewer-title="Alpine Vite Viewer"></gromlab-sprite-viewer>
  </main>
`

document.querySelector('gromlab-sprite-viewer').sources = [appManifest, remoteAppManifest]
Alpine.start()
