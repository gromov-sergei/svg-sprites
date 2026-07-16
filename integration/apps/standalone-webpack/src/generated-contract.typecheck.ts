import type { AppIconElement } from './app-icons'
import type { RemoteAppIconElement } from './remote-app-icons'

const appIcon = document.createElement('app-icon')
const typedAppIcon: AppIconElement = appIcon
const remoteAppIcon = document.createElement('remote-app-icon')
const typedRemoteAppIcon: RemoteAppIconElement = remoteAppIcon

typedAppIcon.icon = 'check'
typedRemoteAppIcon.icon = 'check'

// @ts-expect-error Generated icon names form a literal union.
typedAppIcon.icon = 'missing'
// @ts-expect-error Generated remote icon names form a literal union.
typedRemoteAppIcon.icon = 'missing'
