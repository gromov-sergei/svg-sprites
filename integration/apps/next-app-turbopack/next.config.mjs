import path from 'node:path'

const integrationRoot = path.resolve(import.meta.dirname, '../..')

export default {
  outputFileTracingRoot: integrationRoot,
  turbopack: {
    root: integrationRoot,
  },
}
