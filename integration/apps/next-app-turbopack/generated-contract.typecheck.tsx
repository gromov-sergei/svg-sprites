import { IconsIcon, iconsIconNames } from './src/sprite'
import type { IconsIconName, IconsIconProps, IconsIconStyle } from './src/sprite'
import { IconsIcon as GeneratedIconsIcon } from './src/sprite/.svg-sprite/react/react-component.js'
import type { IconsIconName as GeneratedIconName } from './src/sprite/.svg-sprite/icon-data.js'
import { iconsIconNames as generatedIconNames } from './src/sprite/.svg-sprite/icon-data.js'

const iconName: IconsIconName = iconsIconNames[0]
const generatedIconName: GeneratedIconName = generatedIconNames[0]
const allIconNames: readonly IconsIconName[] = iconsIconNames
const style: IconsIconStyle = { '--icon-color-1': '#16a34a' }
const props: IconsIconProps = { icon: iconName, style }

void allIconNames
void <IconsIcon {...props} />
void <GeneratedIconsIcon icon={generatedIconName} />

// @ts-expect-error Unknown icon names must be rejected by generated declarations.
void <IconsIcon icon="missing" />
