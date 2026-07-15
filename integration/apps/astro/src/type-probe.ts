import type { IconsIconName, IconsIconProps } from './sprite/index.js'
import type { SpriteManifest } from './sprite/.svg-sprite/svg-sprite.manifest.js'

const icon: IconsIconName = 'check'
const props: IconsIconProps = { icon, width: 24, 'aria-label': 'Check icon' }
const framework: SpriteManifest['usage']['framework'] = 'astro'

// @ts-expect-error Unknown source file names are rejected by the generated union.
const unknownIcon: IconsIconName = 'missing'

export { framework, icon, props, unknownIcon }
