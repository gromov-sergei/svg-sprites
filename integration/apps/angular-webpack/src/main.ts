import '@gromlab/svg-sprites/viewer/element'

import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'

import { AppIcon } from './app-icons'
import { RemoteAppIcon } from './remote-app-icons'
import './type-probe'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppIcon, RemoteAppIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main>
      <h1>Angular + Webpack</h1>
      <app-icon
        data-testid="icon"
        data-app="angular-webpack"
        icon="check"
        aria-label="Check icon"
        style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
      />
      <remote-app-icon
        data-testid="remote-icon"
        data-app="angular-webpack-remote"
        icon="check"
        aria-label="Remote check icon"
        style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
      />
      <gromlab-sprite-viewer
        [sources]="viewerSources"
        viewer-title="Angular Webpack Viewer"
      />
    </main>
  `,
})
class AppComponent {
  readonly viewerSources = [
    () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
    () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
  ]
}

bootstrapApplication(AppComponent).catch((error: unknown) => console.error(error))
