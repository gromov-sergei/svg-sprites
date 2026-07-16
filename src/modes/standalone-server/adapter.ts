import { compileSpriteSourceContent } from '../../compiler.js'
import { createCompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'
import { prepareStandaloneServerSprite } from './source.js'

export const standaloneServerAdapter: ModeAdapter<'standalone@server'> = {
  mode: 'standalone@server',
  prepare: prepareStandaloneServerSprite,
  async generate(context) {
    if (context.prepared.kind !== 'content') {
      throw new Error('standalone@server requires prepared local and HTTP SVG content.')
    }
    const standardBytes = await compileSpriteSourceContent(
      context.prepared.name,
      'stack',
      context.prepared.sources,
      context.config.transform,
      { rootViewBox: false },
    )
    const rootViewBoxBytes = await compileSpriteSourceContent(
      context.prepared.name,
      'stack',
      context.prepared.sources,
      context.config.transform,
      { rootViewBox: true },
    )
    const standard = createCompiledSpriteArtifact(standardBytes, context.prepared.iconNames, 'stack')
    const rootViewBox = createCompiledSpriteArtifact(rootViewBoxBytes, context.prepared.iconNames, 'stack')
    const output = generateOutputFiles(context.config, standard, rootViewBox)

    return {
      files: output.files,
      createGitignore: false,
      paths: {
        generatedDir: '.svg-sprite',
        sprite: output.spritePath,
        manifest: output.manifestPath,
      },
      result: { target: 'server' },
    }
  },
}
