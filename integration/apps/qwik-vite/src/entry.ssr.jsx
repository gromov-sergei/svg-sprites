import { renderToStream } from '@builder.io/qwik/server'

import Root from './root'

export default function render(options) {
  return renderToStream(<Root />, options)
}
