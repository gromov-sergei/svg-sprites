import {
  AppIcon,
  appIconNames,
  appIconTagName,
  defineAppIcon,
  type AppIconName,
} from './app-icons/index.js'
import {
  defineRemoteAppIcon,
  RemoteAppIcon,
  remoteAppIconNames,
  remoteAppIconTagName,
  type RemoteAppIconName,
} from './remote-app-icons/index.js'

const appIconName: AppIconName = appIconNames[0]
const appIcon = new AppIcon()
appIcon.icon = appIconName
const remoteAppIconName: RemoteAppIconName = remoteAppIconNames[0]
const remoteAppIcon = new RemoteAppIcon()
remoteAppIcon.icon = remoteAppIconName

const registeredAppIcon = document.createElement(appIconTagName)
registeredAppIcon.icon = 'check'
const registeredRemoteAppIcon = document.createElement(remoteAppIconTagName)
registeredRemoteAppIcon.icon = 'check'
defineAppIcon()
defineRemoteAppIcon()

// @ts-expect-error Generated icon names form a literal union.
registeredAppIcon.icon = 'missing'
// @ts-expect-error Generated remote icon names form a literal union.
registeredRemoteAppIcon.icon = 'missing'
