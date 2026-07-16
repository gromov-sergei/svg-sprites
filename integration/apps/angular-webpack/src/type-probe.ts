import type { AppIconName } from './app-icons'
import type { RemoteAppIconName } from './remote-app-icons'

const validIcon: AppIconName = 'check'
const validRemoteIcon: RemoteAppIconName = 'check'
void validIcon
void validRemoteIcon

// @ts-expect-error generated icon names are a closed union
const invalidIcon: AppIconName = 'missing'
void invalidIcon
