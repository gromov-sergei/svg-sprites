import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'

import { AppIcon } from './app-icons'
import { RemoteAppIcon } from './remote-app-icons'
import './style.css'

export default component$(() => {
  const viewerHost = useSignal()

  useVisibleTask$(async () => {
    await import('@gromlab/svg-sprites/viewer/element')
    const viewer = document.createElement('gromlab-sprite-viewer')
    viewer.viewerTitle = 'Qwik Vite Viewer'
    viewer.sources = [
      () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
      () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
    ]
    viewerHost.value?.append(viewer)
  })

  return (
    <main>
      <h1>Qwik + Vite</h1>
      <AppIcon
        data-testid="icon"
        data-app="qwik-vite"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <RemoteAppIcon
        data-testid="remote-icon"
        data-app="qwik-vite-remote"
        icon="check"
        aria-label="Remote check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <div class="viewer" ref={viewerHost} />
    </main>
  )
})
