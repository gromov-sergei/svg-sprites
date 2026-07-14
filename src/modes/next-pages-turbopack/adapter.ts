import { compileSpriteContent } from '../../compiler.js'
import { createCompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const nextPagesTurbopackAdapter: ModeAdapter<'next@pages/turbopack'> = {
  mode: 'next@pages/turbopack',
  async generate(context) {
    const bytes = await compileSpriteContent(context.prepared.folder, context.config.transform, { rootViewBox: true })
    const artifact = createCompiledSpriteArtifact(bytes, context.prepared.iconNames, 'stack')
    return {
      files: generateOutputFiles(context.config, artifact),
      paths: { generatedDir: '.svg-sprite', sprite: '.svg-sprite/sprite.svg', manifest: '.svg-sprite/svg-sprite.manifest.js', entry: '.svg-sprite/index.js' },
      result: { target: 'next@pages/turbopack', router: 'pages', bundler: 'turbopack' },
    }
  },
}
