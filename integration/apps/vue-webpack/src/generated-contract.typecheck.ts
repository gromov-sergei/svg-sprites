import { IconsIcon } from './sprite/.svg-sprite/index.js'
import type { IconsIconName, IconsIconProps } from './sprite/.svg-sprite/index.js'

const iconName: IconsIconName = 'check'
const iconProps: IconsIconProps = {
  icon: iconName,
  width: 64,
  style: { '--icon-color-1': '#16a34a' },
}

void [IconsIcon, iconProps]

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: IconsIconName = 'missing'
void missingIcon
