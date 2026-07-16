import type { AppIconName } from './app-icons'
import type { SpriteManifest as AppSpriteManifest } from './app-icons/.svg-sprite/svg-sprite.manifest.js'
import type { RemoteAppIconName } from './remote-app-icons'
import type { SpriteManifest as RemoteAppSpriteManifest } from './remote-app-icons/.svg-sprite/svg-sprite.manifest.js'

const icon: AppIconName = 'check'
const remoteIcon: RemoteAppIconName = 'check'
const mode: AppSpriteManifest['mode'] = 'angular@application'
const remoteMode: RemoteAppSpriteManifest['mode'] = 'angular@application'

// @ts-expect-error Unknown source file names are rejected by the generated union.
const unknownIcon: AppIconName = 'missing'

export { icon, mode, remoteIcon, remoteMode, unknownIcon }
