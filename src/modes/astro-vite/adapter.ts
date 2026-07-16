import { resolveCompiledSpriteArtifact } from '../../core/resolve-compiled-artifact.js'
import type { ModeAdapterContext, OutputPlan } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

type AstroViteOutputPlan = Omit<OutputPlan, 'result'> & {
  readonly result: { readonly target: 'vite' }
}

type AstroViteAdapter = {
  readonly mode: 'astro@vite'
  generate(context: ModeAdapterContext): Promise<AstroViteOutputPlan>
}

export const astroViteAdapter: AstroViteAdapter = {
  mode: 'astro@vite',
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
        entry: '.svg-sprite/index.js',
      },
      result: { target: 'vite' },
    }
  },
}
