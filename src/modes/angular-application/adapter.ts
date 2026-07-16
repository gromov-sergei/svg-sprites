import { resolveCompiledSpriteArtifact } from '../../core/resolve-compiled-artifact.js'
import type { ModeAdapterContext, OutputPlan } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

type AngularApplicationOutputPlan = Omit<OutputPlan, 'result'> & {
  readonly result: { readonly target: 'application' }
}

type AngularApplicationAdapter = {
  readonly mode: 'angular@application'
  generate(context: ModeAdapterContext): Promise<AngularApplicationOutputPlan>
}

export const angularApplicationAdapter: AngularApplicationAdapter = {
  mode: 'angular@application',
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
      result: { target: 'application' },
    }
  },
}
