import { resolveCompiledSpriteArtifact } from '../../core/resolve-compiled-artifact.js'
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
    const artifact = await resolveCompiledSpriteArtifact(
      context.prepared,
      context.config.transform,
      { rootViewBox: false },
    )

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
