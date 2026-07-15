import type { IconsIconName, IconsIconProps } from './sprite/.svg-sprite/index.js'

const icon: IconsIconName = 'check'
const props: IconsIconProps = { icon, width: 24, height: 24 }
void props

// @ts-expect-error generated icon names are a closed union
const invalidIcon: IconsIconName = 'missing'
void invalidIcon
