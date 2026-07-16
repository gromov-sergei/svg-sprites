import { AppIcon, appIconNames } from './app-icons/index.js'
import type { AppIconName, AppIconProps } from './app-icons/index.js'
import { RemoteAppIcon, remoteAppIconNames } from './remote-app-icons/index.js'
import type { RemoteAppIconName, RemoteAppIconProps } from './remote-app-icons/index.js'

const appIconName: AppIconName = 'check'
const appProps: AppIconProps = { icon: appIconName, width: 24 }
const remoteAppIconName: RemoteAppIconName = 'check'
const remoteAppProps: RemoteAppIconProps = { icon: remoteAppIconName, width: 24 }

void AppIcon
void appIconNames
void appProps
void RemoteAppIcon
void remoteAppIconNames
void remoteAppProps

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: AppIconName = 'missing'
void missingIcon
