import { compileSpriteContent, type CompileSpriteOptions } from '../compiler.js'
import { loadRemoteSpriteArtifact } from '../release/load.js'
import type { SpriteFolder, TransformOptions } from '../types.js'
import { createCompiledSpriteArtifact, type CompiledSpriteArtifact } from './compiled-artifact.js'
import type { PreparedSprite } from './mode-adapter.js'

/** Компилирует local source либо выбирает готовый profile server release. */
export async function resolveCompiledSpriteArtifact(
  prepared: PreparedSprite,
  transform: TransformOptions,
  options: CompileSpriteOptions,
): Promise<CompiledSpriteArtifact> {
  if (prepared.kind === 'remote') {
    return loadRemoteSpriteArtifact(
      prepared,
      options.rootViewBox ? 'stack-root-viewbox' : 'stack',
    )
  }
  if (prepared.kind !== 'local' && !('folder' in prepared)) {
    throw new Error('This mode cannot compile in-memory server inputs.')
  }
  const folder = prepared.folder as SpriteFolder
  const bytes = await compileSpriteContent(folder, transform, options)
  return createCompiledSpriteArtifact(bytes, prepared.iconNames, 'stack')
}
