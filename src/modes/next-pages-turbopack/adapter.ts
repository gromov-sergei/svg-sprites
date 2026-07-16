import { resolveCompiledSpriteArtifact } from '../../core/resolve-compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const nextPagesTurbopackAdapter: ModeAdapter<'next@pages/turbopack'> = {
  mode: 'next@pages/turbopack',
  async generate(context) {
    const artifact = await resolveCompiledSpriteArtifact(
      context.prepared,
      context.config.transform,
      { rootViewBox: true },
    )
    return {
      files: generateOutputFiles(context.config, artifact),
      paths: { generatedDir: '.svg-sprite', sprite: '.svg-sprite/sprite.svg', manifest: '.svg-sprite/svg-sprite.manifest.js', entry: '.svg-sprite/index.js' },
      result: { target: 'next@pages/turbopack', router: 'pages', bundler: 'turbopack' },
    }
  },
}
