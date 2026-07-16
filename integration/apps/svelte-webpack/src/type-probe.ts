import type { ComponentProps } from 'svelte'
import { AppIcon } from './app-icons/index.js'
import type { AppIconName, AppIconProps } from './app-icons/index.js'
import { RemoteAppIcon } from './remote-app-icons/index.js'
import type { RemoteAppIconName, RemoteAppIconProps } from './remote-app-icons/index.js'

const iconName: AppIconName = 'check'
const inferred: ComponentProps<typeof AppIcon> = { icon: iconName, width: 64, height: 64 }
const declared: AppIconProps = inferred
const remoteIconName: RemoteAppIconName = 'check'
const remoteInferred: ComponentProps<typeof RemoteAppIcon> = {
  icon: remoteIconName,
  width: 64,
  height: 64,
}
const remoteDeclared: RemoteAppIconProps = remoteInferred

void [declared, remoteDeclared]
