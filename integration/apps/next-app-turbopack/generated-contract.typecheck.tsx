import { AppIcon, appIconNames } from './src/app-icons'
import type { AppIconName, AppIconProps, AppIconStyle } from './src/app-icons'
import { AppIcon as GeneratedAppIcon } from './src/app-icons/.svg-sprite/react/react-component.js'
import type { AppIconName as GeneratedAppIconName } from './src/app-icons/.svg-sprite/icon-data.js'
import { appIconNames as generatedAppIconNames } from './src/app-icons/.svg-sprite/icon-data.js'
import { RemoteAppIcon, remoteAppIconNames } from './src/remote-app-icons'
import type { RemoteAppIconName, RemoteAppIconProps } from './src/remote-app-icons'
import { RemoteAppIcon as GeneratedRemoteAppIcon } from './src/remote-app-icons/.svg-sprite/react/react-component.js'
import type { RemoteAppIconName as GeneratedRemoteAppIconName } from './src/remote-app-icons/.svg-sprite/icon-data.js'
import { remoteAppIconNames as generatedRemoteAppIconNames } from './src/remote-app-icons/.svg-sprite/icon-data.js'

const appIconName: AppIconName = appIconNames[0]
const generatedAppIconName: GeneratedAppIconName = generatedAppIconNames[0]
const allAppIconNames: readonly AppIconName[] = appIconNames
const style: AppIconStyle = { '--icon-color-1': '#16a34a' }
const appProps: AppIconProps = { icon: appIconName, style }
const remoteAppIconName: RemoteAppIconName = remoteAppIconNames[0]
const generatedRemoteAppIconName: GeneratedRemoteAppIconName = generatedRemoteAppIconNames[0]
const remoteAppProps: RemoteAppIconProps = { icon: remoteAppIconName, style }

void allAppIconNames
void <AppIcon {...appProps} />
void <GeneratedAppIcon icon={generatedAppIconName} />
void <RemoteAppIcon {...remoteAppProps} />
void <GeneratedRemoteAppIcon icon={generatedRemoteAppIconName} />

// @ts-expect-error Unknown icon names must be rejected by generated declarations.
void <AppIcon icon="missing" />
