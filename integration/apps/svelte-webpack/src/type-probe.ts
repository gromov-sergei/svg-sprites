import type { ComponentProps } from 'svelte'
import { IconsIcon } from './sprite/index.js'
import type { IconsIconName, IconsIconProps } from './sprite/index.js'

const icon: IconsIconName = 'check'
const inferred: ComponentProps<typeof IconsIcon> = { icon, width: 64, height: 64 }
const declared: IconsIconProps = inferred

void declared
