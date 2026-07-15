import path from 'node:path'

const repositoryRoot = path.resolve(import.meta.dirname, '../../..')
const integrationRoot = path.resolve(import.meta.dirname, '../..')

export default {
  outputFileTracingRoot: repositoryRoot,
  turbopack: {
    root: repositoryRoot,
  },
  webpack(config) {
    config.resolve.alias.react = path.resolve(integrationRoot, 'node_modules/react')
    config.resolve.alias['react-dom'] = path.resolve(integrationRoot, 'node_modules/react-dom')
    return config
  },
}
