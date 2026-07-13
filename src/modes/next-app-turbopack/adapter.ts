import { compileSpriteContent } from '../../compiler.js'
import { createCompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const nextAppTurbopackAdapter: ModeAdapter<'next@app/turbopack'> = {
  mode: 'next@app/turbopack',
  contractVersion: 5,

  async generate(context) {
    const bytes = await compileSpriteContent(context.prepared.folder, context.config.transform, {
      rootViewBox: true,
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
      result: { target: 'next@app/turbopack', router: 'app', bundler: 'turbopack' },
    }
  },
}
