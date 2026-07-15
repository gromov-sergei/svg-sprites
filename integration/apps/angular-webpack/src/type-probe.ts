import type { IconsIconName } from './sprite'

const validIcon: IconsIconName = 'check'
void validIcon

// @ts-expect-error generated icon names are a closed union
const invalidIcon: IconsIconName = 'missing'
void invalidIcon
