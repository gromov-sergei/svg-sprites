import { AppIcon } from './app-icons/.svg-sprite/index.js'
import type { AppIconName, AppIconProps } from './app-icons/.svg-sprite/index.js'
import { RemoteAppIcon } from './remote-app-icons/.svg-sprite/index.js'
import type {
  RemoteAppIconName,
  RemoteAppIconProps,
} from './remote-app-icons/.svg-sprite/index.js'

const iconName: AppIconName = 'check'
const iconProps: AppIconProps = { icon: iconName, width: 24, height: 24 }
const remoteIconName: RemoteAppIconName = 'check'
const remoteIconProps: RemoteAppIconProps = {
  icon: remoteIconName,
  width: 24,
  height: 24,
}

void [AppIcon, RemoteAppIcon, iconProps, remoteIconProps]

// @ts-expect-error generated icon names are a closed union
const invalidIcon: AppIconName = 'missing'
void invalidIcon

// @ts-expect-error generated remote icon names are a closed union
const invalidRemoteIcon: RemoteAppIconName = 'missing'
void invalidRemoteIcon
