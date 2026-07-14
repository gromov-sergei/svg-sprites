import type { IconsIconElement } from './sprite'

const icon = document.createElement('icons-icon')
const typedIcon: IconsIconElement = icon

typedIcon.icon = 'check'

// @ts-expect-error Generated icon names form a literal union.
typedIcon.icon = 'missing'
