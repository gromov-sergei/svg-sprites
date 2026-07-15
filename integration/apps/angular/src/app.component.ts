import '@gromlab/svg-sprites/viewer/element'

import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core'

import { IconsIcon } from './sprite'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IconsIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main>
      <h1>Angular application builder</h1>
      <icons-icon
        data-testid="icon"
        data-app="angular"
        icon="check"
        aria-label="Check icon"
        style="color: #16a34a; --icon-color-1: #16a34a"
      />
      <gromlab-sprite-viewer
        [sources]="viewerSources"
        viewer-title="Angular Application Viewer"
      />
    </main>
  `,
})
export class AppComponent {
  readonly viewerSources = [
    () => import('./sprite/.svg-sprite/svg-sprite.manifest.js'),
  ]
}
