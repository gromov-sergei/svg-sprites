import {
  appAlpinePlugin,
  appIconDirective,
  appIconMagic,
  appIconNames,
  type AppIconName,
} from './app-icons/index.js'
import {
  remoteAppAlpinePlugin,
  remoteAppIconDirective,
  remoteAppIconMagic,
  remoteAppIconNames,
  type RemoteAppIconName,
} from './remote-app-icons/index.js'

declare const Alpine: {
  plugin(plugin: typeof appAlpinePlugin | typeof remoteAppAlpinePlugin): void
}

const appIconName: AppIconName = appIconNames[0]
const appDirective: 'app-icon' = appIconDirective
const appMagic: 'appIconHref' = appIconMagic
const remoteAppIconName: RemoteAppIconName = remoteAppIconNames[0]
const remoteAppDirective: 'remote-app-icon' = remoteAppIconDirective
const remoteAppMagic: 'remoteAppIconHref' = remoteAppIconMagic

Alpine.plugin(appAlpinePlugin)
Alpine.plugin(remoteAppAlpinePlugin)
void appIconName
void appDirective
void appMagic
void remoteAppIconName
void remoteAppDirective
void remoteAppMagic

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: AppIconName = 'missing'
void missingIcon
// @ts-expect-error Generated remote icon names form a literal union.
const missingRemoteIcon: RemoteAppIconName = 'missing'
void missingRemoteIcon
