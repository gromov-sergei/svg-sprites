import { compileSpriteContent } from '../../compiler.js'
import { createCompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const standaloneAdapter: ModeAdapter<'standalone'> = {
  mode: 'standalone',
  async generate(context) {
    const bytes = await compileSpriteContent(context.prepared.folder, context.config.transform, {
      rootViewBox: false,
    })
    const artifact = createCompiledSpriteArtifact(bytes, context.prepared.iconNames, 'stack')

    return {
      files: generateOutputFiles(context.config, artifact),
      createGitignore: false,
      paths: {
        generatedDir: '.svg-sprite',
        sprite: '.svg-sprite/sprite.svg',
        manifest: '.svg-sprite/svg-sprite.manifest.json',
      },
      result: { target: 'static' },
    }
  },
}
