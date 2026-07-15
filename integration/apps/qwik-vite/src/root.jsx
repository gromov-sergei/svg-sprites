import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'

import { IconsIcon } from './sprite'
import './style.css'

export default component$(() => {
  const viewerHost = useSignal()

  useVisibleTask$(async () => {
    await import('@gromlab/svg-sprites/viewer/element')
    const viewer = document.createElement('gromlab-sprite-viewer')
    viewer.viewerTitle = 'Qwik Vite Viewer'
    viewer.sources = [() => import('./sprite/.svg-sprite/svg-sprite.manifest.js')]
    viewerHost.value?.append(viewer)
  })

  return (
    <main>
      <h1>Qwik + Vite</h1>
      <IconsIcon
        data-testid="icon"
        data-app="qwik-vite"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <div class="viewer" ref={viewerHost} />
    </main>
  )
})
