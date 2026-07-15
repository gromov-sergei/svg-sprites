import type { IconsIconName } from './sprite'
import type { SpriteManifest } from './sprite/.svg-sprite/svg-sprite.manifest.js'

const icon: IconsIconName = 'check'
const mode: SpriteManifest['mode'] = 'angular@application'

// @ts-expect-error Unknown source file names are rejected by the generated union.
const unknownIcon: IconsIconName = 'missing'

export { icon, mode, unknownIcon }
