import { createHash } from 'node:crypto'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ServerSpriteManifest, ServerSpriteAsset } from '../../release/types.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const OUTPUT_DIR = '.svg-sprite'

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function asset(fileName: string, bytes: Uint8Array): ServerSpriteAsset {
  return {
    href: `./${fileName}`,
    sha256: sha256(bytes),
    byteLength: bytes.byteLength,
  }
}

function spriteFileName(prefix: string, bytes: Uint8Array): string {
  return `${prefix}.${sha256(bytes).slice(0, 16)}.svg`
}

export type StandaloneServerOutput = {
  files: GeneratedFile[]
  spritePath: `.svg-sprite/${string}`
  manifestPath: '.svg-sprite/svg-sprite.manifest.json'
}

export function generateOutputFiles(
  config: ResolvedSpriteConfig,
  standard: CompiledSpriteArtifact,
  rootViewBox: CompiledSpriteArtifact,
): StandaloneServerOutput {
  if (JSON.stringify(standard.icons) !== JSON.stringify(rootViewBox.icons)) {
    throw new Error('standalone@server sprite profiles produced different icon metadata.')
  }
  const standardName = spriteFileName('sprite', standard.bytes)
  const rootViewBoxName = spriteFileName('sprite-root-viewbox', rootViewBox.bytes)
  const manifest: ServerSpriteManifest = {
    kind: '@gromlab/svg-sprites/server',
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    mode: 'standalone@server',
    target: 'server',
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    format: 'stack',
    generatedNotice: config.generatedNotice,
    transform: config.transform,
    iconCount: standard.icons.length,
    icons: standard.icons,
    sprites: {
      stack: asset(standardName, standard.bytes),
      'stack-root-viewbox': asset(rootViewBoxName, rootViewBox.bytes),
    },
  }
  const spritePath = `${OUTPUT_DIR}/${standardName}` as const
  return {
    files: [
      { path: spritePath, content: standard.bytes },
      { path: `${OUTPUT_DIR}/${rootViewBoxName}`, content: rootViewBox.bytes },
      { path: `${OUTPUT_DIR}/svg-sprite.manifest.json`, content: `${JSON.stringify(manifest, null, 2)}\n` },
    ],
    spritePath,
    manifestPath: '.svg-sprite/svg-sprite.manifest.json',
  }
}
