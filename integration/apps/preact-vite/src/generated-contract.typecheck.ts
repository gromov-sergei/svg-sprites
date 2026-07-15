import { IconsIcon, iconsIconNames } from './sprite/index.js'
import type { IconsIconName, IconsIconProps } from './sprite/index.js'

const iconName: IconsIconName = 'check'
const props: IconsIconProps = { icon: iconName, width: 24 }

void IconsIcon
void iconsIconNames
void props

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: IconsIconName = 'missing'
void missingIcon
