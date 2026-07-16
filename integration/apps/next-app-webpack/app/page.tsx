import { AppIcon } from '../src/app-icons'
import { RemoteAppIcon } from '../src/remote-app-icons'
import { AppSpriteViewer } from './sprite-viewer'

export default function Page() {
  return (
    <main>
      <h1>Next.js App Router + Webpack</h1>
      <AppIcon
        data-testid="icon"
        data-app="next-app-webpack"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <RemoteAppIcon
        data-testid="remote-icon"
        data-app="next-app-webpack-remote"
        icon="check"
        aria-label="Remote check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
      <AppSpriteViewer />
    </main>
  )
}
