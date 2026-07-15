import { SpriteViewer } from '@gromlab/svg-sprites/react'
import { IconsIcon } from '../src/sprite'

const viewerSources = [
  () => import('../src/sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

export default function Page() {
  return (
    <main>
      <h1>Next.js Pages Router + Webpack</h1>
      <IconsIcon
        data-testid="icon"
        data-app="next-pages-webpack"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <SpriteViewer sources={viewerSources} title="Next Pages Webpack Viewer" style={{ marginTop: 32 }} />
    </main>
  )
}
