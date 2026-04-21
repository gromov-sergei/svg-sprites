import { green, red, yellow, cyan, bold } from 'colorette'

export const log = {
  success: (msg: string) => console.log(green(msg)),
  error: (msg: string) => console.error(red(msg)),
  warn: (msg: string) => console.warn(yellow(msg)),
  info: (msg: string) => console.log(cyan(msg)),
  title: (msg: string) => console.log(bold(cyan(msg))),
}
