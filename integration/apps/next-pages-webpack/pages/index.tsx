import { SpriteViewer } from '@gromlab/svg-sprites/react'
import { AppIcon } from '../src/app-icons'
import { RemoteAppIcon } from '../src/remote-app-icons'

const viewerSources = [
  () => import('../src/app-icons/.svg-sprite/svg-sprite.manifest.js'),
  () => import('../src/remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
] as const

export default function Page() {
  return (
    <main>
      <h1>Next.js Pages Router + Webpack</h1>
      <AppIcon
        data-testid="icon"
        data-app="next-pages-webpack"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <RemoteAppIcon
        data-testid="remote-icon"
        data-app="next-pages-webpack-remote"
        icon="check"
        aria-label="Remote check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <SpriteViewer sources={viewerSources} title="Next Pages Webpack Viewer" style={{ marginTop: 32 }} />
    </main>
  )
}
