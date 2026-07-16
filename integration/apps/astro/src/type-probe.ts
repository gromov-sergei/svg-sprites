import type { AppIconName, AppIconProps } from './app-icons/index.js'
import type { SpriteManifest } from './app-icons/.svg-sprite/svg-sprite.manifest.js'
import type { RemoteAppIconName, RemoteAppIconProps } from './remote-app-icons/index.js'
import type { SpriteManifest as RemoteSpriteManifest } from './remote-app-icons/.svg-sprite/svg-sprite.manifest.js'

const icon: AppIconName = 'check'
const remoteIcon: RemoteAppIconName = 'check'
const props: AppIconProps = { icon, width: 24, 'aria-label': 'Check icon' }
const remoteProps: RemoteAppIconProps = { icon: remoteIcon, width: 24, 'aria-label': 'Remote check icon' }
const framework: SpriteManifest['usage']['framework'] = 'astro'
const remoteFramework: RemoteSpriteManifest['usage']['framework'] = 'astro'

// @ts-expect-error Unknown source file names are rejected by the generated union.
const unknownIcon: AppIconName = 'missing'

export { framework, icon, props, remoteFramework, remoteIcon, remoteProps, unknownIcon }
