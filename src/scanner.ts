import fs from 'node:fs'
import path from 'node:path'
import {
  convertPathToPattern,
  globSync,
  isDynamicPattern,
} from 'tinyglobby'
import type { SpriteFolder } from './types.js'

type PositiveInput = {
  source: string
  pattern: string
  directory: string | null
}

function resolvePositiveInput(source: string): PositiveInput {
  if (!fs.existsSync(source)) {
    if (isDynamicPattern(source)) return { source, pattern: source, directory: null }
    throw new Error(`Input path does not exist: ${source}`)
  }

  const stats = fs.statSync(source)
  if (stats.isDirectory()) {
    return {
      source,
      pattern: `${convertPathToPattern(source)}/*.svg`,
      directory: source,
    }
  }
  if (!stats.isFile()) {
    throw new Error(`Input path must be a file, directory, or glob pattern: ${source}`)
  }
  if (!source.endsWith('.svg')) {
    throw new Error(`File is not an SVG: ${source}`)
  }

  return { source, pattern: convertPathToPattern(source), directory: null }
}

function resolveExclusion(source: string): string {
  const target = source.slice(1)
  if (!fs.existsSync(target)) return source

  const stats = fs.statSync(target)
  if (stats.isDirectory()) return `!${convertPathToPattern(target)}/**`
  if (stats.isFile()) return `!${convertPathToPattern(target)}`
  return source
}

type ResolveSpriteSourcesOptions = {
  name: string
  format: SpriteFolder['format']
  input: string[]
}

const GLOB_OPTIONS = {
  absolute: true,
  expandDirectories: false,
  onlyFiles: true,
} as const

/** Разрешает пути, папки и glob-шаблоны в один набор исходных SVG. */
export function resolveSpriteSources(options: ResolveSpriteSourcesOptions): SpriteFolder {
  const { name, format, input } = options
  const positives = input
    .filter((entry) => !entry.startsWith('!'))
    .map(resolvePositiveInput)
  const exclusions = input
    .filter((entry) => entry.startsWith('!'))
    .map(resolveExclusion)

  if (positives.length === 0) {
    throw new Error('Sprite input must include at least one path or positive glob pattern.')
  }

  for (const { source, pattern } of positives) {
    const matchedSvg = globSync(pattern, GLOB_OPTIONS).some((filePath) => filePath.endsWith('.svg'))
    if (!matchedSvg) throw new Error(`Input matched no SVG files: ${source}`)
  }

  const files = [...new Set(
    globSync([
      ...positives.map(({ pattern }) => pattern),
      ...exclusions,
    ], GLOB_OPTIONS)
      .filter((filePath) => filePath.endsWith('.svg'))
      .map((filePath) => path.resolve(filePath)),
  )].sort()

  if (files.length === 0) {
    throw new Error(`Sprite "${name}" has no SVG files in configured inputs.`)
  }

  return {
    name,
    format,
    path: input.length === 1 ? positives[0].directory : null,
    files,
  }
}
