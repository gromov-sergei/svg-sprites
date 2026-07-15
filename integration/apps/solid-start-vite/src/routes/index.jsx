import { onMount } from 'solid-js'

import { IconsIcon } from '../sprite'

export default function Home() {
  let viewerHost

  onMount(async () => {
    await import('@gromlab/svg-sprites/viewer/element')
    const viewer = document.createElement('gromlab-sprite-viewer')
    viewer.viewerTitle = 'SolidStart Vite Viewer'
    viewer.sources = [() => import('../sprite/.svg-sprite/svg-sprite.manifest.js')]
    viewerHost.append(viewer)
  })

  return (
    <main>
      <h1>SolidStart + Vite</h1>
      <IconsIcon
        data-testid="icon"
        data-app="solid-start-vite"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <div class="viewer" ref={viewerHost} />
    </main>
  )
}
