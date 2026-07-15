import { compileSpriteContent } from '../../compiler.js'
import { createCompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { ModeAdapterContext, OutputPlan } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

type AngularWebpackOutputPlan = Omit<OutputPlan, 'result'> & {
  readonly result: { readonly target: 'webpack' }
}

type AngularWebpackAdapter = {
  readonly mode: 'angular@webpack'
  generate(context: ModeAdapterContext): Promise<AngularWebpackOutputPlan>
}

export const angularWebpackAdapter: AngularWebpackAdapter = {
  mode: 'angular@webpack',
  async generate(context) {
    const bytes = await compileSpriteContent(
      context.prepared.folder,
      context.config.transform,
      { rootViewBox: false },
    )
    const artifact = createCompiledSpriteArtifact(bytes, context.prepared.iconNames, 'stack')

    return {
      files: generateOutputFiles(context.config, artifact),
      paths: {
        generatedDir: '.svg-sprite',
        sprite: '.svg-sprite/sprite.svg',
        manifest: '.svg-sprite/svg-sprite.manifest.js',
        entry: '.svg-sprite/index.ts',
      },
      result: { target: 'webpack' },
    }
  },
}
