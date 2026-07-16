import { AppIcon } from '../src/app-icons/.svg-sprite/index.js'
import type { AppIconName, AppIconProps } from '../src/app-icons/.svg-sprite/index.js'
import { RemoteAppIcon } from '../src/remote-app-icons/.svg-sprite/index.js'
import type {
  RemoteAppIconName,
  RemoteAppIconProps,
} from '../src/remote-app-icons/.svg-sprite/index.js'

const iconName: AppIconName = 'check'
const iconProps: AppIconProps = {
  icon: iconName,
  width: 64,
  style: { '--icon-color-1': '#16a34a' },
}
const remoteIconName: RemoteAppIconName = 'check'
const remoteIconProps: RemoteAppIconProps = {
  icon: remoteIconName,
  width: 64,
  style: { '--icon-color-1': '#16a34a' },
}

void [AppIcon, RemoteAppIcon, iconProps, remoteIconProps]

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: AppIconName = 'missing'
void missingIcon

// @ts-expect-error Generated remote icon names form a literal union.
const missingRemoteIcon: RemoteAppIconName = 'missing'
void missingRemoteIcon
