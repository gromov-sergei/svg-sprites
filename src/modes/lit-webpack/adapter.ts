import { compileSpriteContent } from '../../compiler.js'
import { createCompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const litWebpackAdapter: ModeAdapter<'lit@webpack'> = {
  mode: 'lit@webpack',
  async generate(context) {
    const bytes = await compileSpriteContent(context.prepared.folder, context.config.transform, {
      rootViewBox: false,
    })
    const artifact = createCompiledSpriteArtifact(bytes, context.prepared.iconNames, 'stack')

    return {
      files: generateOutputFiles(context.config, artifact),
      paths: {
        generatedDir: '.svg-sprite',
        sprite: '.svg-sprite/sprite.svg',
        manifest: '.svg-sprite/svg-sprite.manifest.js',
        entry: '.svg-sprite/index.js',
      },
      result: { target: 'webpack' },
    }
  },
}
