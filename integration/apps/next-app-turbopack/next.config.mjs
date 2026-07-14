import path from 'node:path'

const repositoryRoot = path.resolve(import.meta.dirname, '../../..')

export default {
  outputFileTracingRoot: repositoryRoot,
  turbopack: {
    root: repositoryRoot,
  },
}
