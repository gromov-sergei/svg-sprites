import path from 'node:path'
import type { CompiledSpriteArtifact } from '../../core/compiled-artifact.js'
import { GENERATED_MARKER } from '../../core/generated-markers.js'
import type { GeneratedFile } from '../../core/mode-adapter.js'
import type { ResolvedSpriteConfig } from '../../types.js'

const MODE = 'standalone'
const TARGET = 'static'
const OUTPUT_DIR = '.svg-sprite'
const NOTICE = 'АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. Не редактируйте вручную.'

function generated(enabled: boolean): string {
  return enabled
    ? `${NOTICE} ${GENERATED_MARKER}.`
    : `${GENERATED_MARKER}. Do not edit.`
}

function svg(bytes: Uint8Array, enabled: boolean): string {
  const marker = enabled ? `${NOTICE}\n  ${GENERATED_MARKER}.` : `${GENERATED_MARKER}. Do not edit.`
  const content = new TextDecoder().decode(bytes)
  return content.startsWith('<?xml')
    ? content.replace(/^(<\?xml[^?]*\?>)\s*/, `$1\n<!-- ${marker} -->\n`)
    : `<!-- ${marker} -->\n${content}`
}

function manifestData(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact) {
  return {
    schemaVersion: 1,
    generator: '@gromlab/svg-sprites',
    generated: generated(config.generatedNotice),
    name: config.name,
    ...(config.description === undefined ? {} : { description: config.description }),
    mode: MODE,
    target: TARGET,
    format: artifact.format,
    iconCount: artifact.icons.length,
    icons: artifact.icons,
  }
}

function manifest(config: ResolvedSpriteConfig, artifact: CompiledSpriteArtifact): string {
  return `${JSON.stringify(manifestData(config, artifact), null, 2)}\n`
}

export function generateOutputFiles(
  config: ResolvedSpriteConfig,
  artifact: CompiledSpriteArtifact,
): GeneratedFile[] {
  return [
    { path: path.posix.join(OUTPUT_DIR, 'sprite.svg'), content: svg(artifact.bytes, config.generatedNotice) },
    { path: path.posix.join(OUTPUT_DIR, 'svg-sprite.manifest.json'), content: manifest(config, artifact) },
  ]
}
