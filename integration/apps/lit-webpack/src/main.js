import '@gromlab/svg-sprites/viewer/element'
import appManifest from './app-icons/.svg-sprite/svg-sprite.manifest.js'
import { defineAppIcon } from './app-icons/index.js'
import remoteAppManifest from './remote-app-icons/.svg-sprite/svg-sprite.manifest.js'
import { defineRemoteAppIcon } from './remote-app-icons/index.js'

defineAppIcon()
defineRemoteAppIcon()

document.querySelector('#app').innerHTML = `
  <h1>Lit + Webpack</h1>
  <app-icon
    data-testid="icon"
    data-app="lit-webpack"
    icon="check"
    role="img"
    aria-label="Check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  ></app-icon>
  <remote-app-icon
    data-testid="remote-icon"
    data-app="lit-webpack-remote"
    icon="check"
    role="img"
    aria-label="Remote check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  ></remote-app-icon>
  <gromlab-sprite-viewer viewer-title="Lit Webpack Viewer"></gromlab-sprite-viewer>
`

document.querySelector('gromlab-sprite-viewer').sources = [appManifest, remoteAppManifest]
