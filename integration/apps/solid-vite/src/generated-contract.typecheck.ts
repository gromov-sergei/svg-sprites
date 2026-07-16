import { AppIcon, appIconNames } from './app-icons'
import type { AppIconName, AppIconProps } from './app-icons'
import { RemoteAppIcon, remoteAppIconNames } from './remote-app-icons'
import type { RemoteAppIconName, RemoteAppIconProps } from './remote-app-icons'

const iconName: AppIconName = 'check'
const remoteIconName: RemoteAppIconName = 'check'
const props: AppIconProps = { icon: iconName, width: 24 }
const remoteProps: RemoteAppIconProps = { icon: remoteIconName, width: 24 }

void AppIcon
void appIconNames
void RemoteAppIcon
void remoteAppIconNames
void props
void remoteProps

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: AppIconName = 'missing'
void missingIcon
