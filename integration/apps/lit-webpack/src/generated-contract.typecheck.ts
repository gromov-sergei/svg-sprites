import {
  defineIconsIcon,
  IconsIcon,
  iconsIconNames,
  iconsIconTagName,
  type IconsIconName,
} from './sprite/index.js'

const iconName: IconsIconName = iconsIconNames[0]
const icon = new IconsIcon()
icon.icon = iconName

const registeredIcon = document.createElement(iconsIconTagName)
registeredIcon.icon = 'check'
defineIconsIcon()

// @ts-expect-error Generated icon names form a literal union.
registeredIcon.icon = 'missing'
