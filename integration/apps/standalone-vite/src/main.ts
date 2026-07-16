import '@gromlab/svg-sprites/viewer/element'
import type { SpriteViewerElement } from '@gromlab/svg-sprites/viewer'
import appManifest from './app-icons/.svg-sprite/svg-sprite.manifest.js'
import { appSpriteUrl, defineAppIconElement } from './app-icons'
import remoteAppManifest from './remote-app-icons/.svg-sprite/svg-sprite.manifest.js'
import { defineRemoteAppIconElement, remoteAppSpriteUrl } from './remote-app-icons'
import './style.css'

const appCheck = appManifest.icons.find((icon) => icon.name === 'check')
if (!appCheck || appManifest.spriteUrl !== appSpriteUrl) {
  throw new Error('Generated Vite facade and manifest disagree.')
}

const remoteAppCheck = remoteAppManifest.icons.find((icon) => icon.name === 'check')
if (!remoteAppCheck || remoteAppManifest.spriteUrl !== remoteAppSpriteUrl) {
  throw new Error('Generated remote Vite facade and manifest disagree.')
}

defineAppIconElement()
defineRemoteAppIconElement()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Standalone + Vite</h1>
  <app-icon
    data-testid="icon"
    data-app="standalone-vite"
    icon="check"
    role="img"
    aria-label="Check icon"
  ></app-icon>
  <remote-app-icon
    data-testid="remote-icon"
    data-app="standalone-vite-remote"
    icon="check"
    role="img"
    aria-label="Remote check icon"
  ></remote-app-icon>
  <gromlab-sprite-viewer></gromlab-sprite-viewer>
`

const viewer = document.querySelector<SpriteViewerElement>('gromlab-sprite-viewer')!
viewer.viewerTitle = 'Standalone Vite Viewer'
viewer.sources = [appManifest, remoteAppManifest]
