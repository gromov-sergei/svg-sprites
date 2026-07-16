import { resolveCompiledSpriteArtifact } from '../../core/resolve-compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const nextAppTurbopackAdapter: ModeAdapter<'next@app/turbopack'> = {
  mode: 'next@app/turbopack',
  async generate(context) {
    const artifact = await resolveCompiledSpriteArtifact(
      context.prepared,
      context.config.transform,
      { rootViewBox: true },
    )
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
