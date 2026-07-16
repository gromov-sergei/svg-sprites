import type { ComponentProps } from 'svelte'
import { AppIcon } from './app-icons/index.js'
import type { AppIconName, AppIconProps } from './app-icons/index.js'
import { RemoteAppIcon } from './remote-app-icons/index.js'
import type { RemoteAppIconName, RemoteAppIconProps } from './remote-app-icons/index.js'

const iconName: AppIconName = 'check'
const inferred: ComponentProps<typeof AppIcon> = { icon: iconName, role: 'img' }
const declared: AppIconProps = inferred
const remoteIconName: RemoteAppIconName = 'check'
const remoteInferred: ComponentProps<typeof RemoteAppIcon> = {
  icon: remoteIconName,
  role: 'img',
}
const remoteDeclared: RemoteAppIconProps = remoteInferred

void [declared, remoteDeclared]
