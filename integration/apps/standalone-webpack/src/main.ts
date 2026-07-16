import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import appManifest from './app-icons/.svg-sprite/svg-sprite.manifest.js'
import { appSpriteUrl, defineAppIconElement } from './app-icons'
import remoteAppManifest from './remote-app-icons/.svg-sprite/svg-sprite.manifest.js'
import { defineRemoteAppIconElement, remoteAppSpriteUrl } from './remote-app-icons'

const appCheck = appManifest.icons.find((icon) => icon.name === 'check')
if (!appCheck || appManifest.spriteUrl !== appSpriteUrl) {
  throw new Error('Generated Webpack facade and manifest disagree.')
}

const remoteAppCheck = remoteAppManifest.icons.find((icon) => icon.name === 'check')
if (!remoteAppCheck || remoteAppManifest.spriteUrl !== remoteAppSpriteUrl) {
  throw new Error('Generated remote Webpack facade and manifest disagree.')
}

defineAppIconElement()
defineRemoteAppIconElement()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Standalone + Webpack</h1>
  <app-icon
    data-testid="icon"
    data-app="standalone-webpack"
    icon="check"
    role="img"
    aria-label="Check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  ></app-icon>
  <remote-app-icon
    data-testid="remote-icon"
    data-app="standalone-webpack-remote"
    icon="check"
    role="img"
    aria-label="Remote check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  ></remote-app-icon>
  <gromlab-sprite-viewer></gromlab-sprite-viewer>
`

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.viewerTitle = 'Standalone Webpack Viewer'
viewer.sources = [appManifest, remoteAppManifest]
