import { resolveCompiledSpriteArtifact } from '../../core/resolve-compiled-artifact.js'
import type { ModeAdapter } from '../../core/mode-adapter.js'
import { generateOutputFiles } from './output.js'

export const standaloneAdapter: ModeAdapter<'standalone'> = {
  mode: 'standalone',
  async generate(context) {
    const artifact = await resolveCompiledSpriteArtifact(
      context.prepared,
      context.config.transform,
      { rootViewBox: false },
    )

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
