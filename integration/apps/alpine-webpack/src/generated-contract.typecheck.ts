import {
  iconsAlpinePlugin,
  iconsIconDirective,
  iconsIconMagic,
  iconsIconNames,
  type IconsIconName,
} from './sprite/index.js'

declare const Alpine: { plugin(plugin: typeof iconsAlpinePlugin): void }

const iconName: IconsIconName = iconsIconNames[0]
const directive: 'icons-icon' = iconsIconDirective
const magic: 'iconsIconHref' = iconsIconMagic

Alpine.plugin(iconsAlpinePlugin)
void iconName
void directive
void magic

// @ts-expect-error Generated icon names form a literal union.
const missingIcon: IconsIconName = 'missing'
void missingIcon
