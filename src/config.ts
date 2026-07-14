import fs from 'node:fs'
import path from 'node:path'
import { createJiti } from 'jiti'
import { toKebabCase, validateSpriteName } from './core/naming.js'
import type { SpriteMode } from './targets/types.js'
import type { ResolvedSpriteConfig, SpriteConfig, TransformOptions } from './types.js'

const CONFIG_EXTENSIONS = new Set(['.js', '.json', '.ts'])
const CONFIG_FIELDS = new Set([
  'mode',
  'name',
  'description',
  'inputFolder',
  'inputFiles',
  'transform',
  'generatedNotice',
])
const TRANSFORM_FIELDS = new Set(['removeSize', 'replaceColors', 'addTransition'])
const MODES = new Set<SpriteMode>([
  'standalone',
  'standalone@vite',
  'standalone@webpack',
  'react@vite',
  'react@webpack',
  'next@app/turbopack',
  'next@app/webpack',
  'next@pages/turbopack',
  'next@pages/webpack',
])

export type SpriteConfigSource = {
  rootDir: string
  configPath: string | null
  config: SpriteConfig
}

export function isSpriteMode(value: unknown): value is SpriteMode {
  return typeof value === 'string' && MODES.has(value as SpriteMode)
}

function getDefaultName(rootDir: string): string {
  const rootName = path.basename(rootDir)
  const source = rootName === 'svg-sprite' || rootName === 'svg-sprites'
    ? path.basename(path.dirname(rootDir))
    : rootName
  const name = toKebabCase(source)

  if (!name) throw new Error(`Cannot infer sprite name from directory: ${rootDir}`)
  return name
}

function configError(message: string): Error {
  return new Error(`Sprite config: ${message}`)
}

/** Проверяет единый конфиг независимо от формата исходного файла. */
export function validateSpriteConfig(value: unknown): asserts value is SpriteConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw configError('expected an object.')
  }

  const config = value as Record<string, unknown>

  if ('output' in config || 'sprites' in config || 'preview' in config) {
    throw configError('legacy config fields are no longer supported.')
  }
  for (const field of Object.keys(config)) {
    if (!CONFIG_FIELDS.has(field)) throw configError(`unknown field "${field}".`)
  }
  if (config.mode !== undefined && !isSpriteMode(config.mode)) {
    throw configError(`unsupported "mode": ${String(config.mode)}.`)
  }
  if (config.name !== undefined && typeof config.name !== 'string') {
    throw configError('"name" must be a string.')
  }
  if (config.description !== undefined && typeof config.description !== 'string') {
    throw configError('"description" must be a string.')
  }
  if ('icons' in config) {
    throw configError('"icons" was renamed to "inputFolder".')
  }
  if (config.inputFolder !== undefined && (
    typeof config.inputFolder !== 'string' || config.inputFolder.trim() === ''
  )) {
    throw configError('"inputFolder" must be a non-empty string.')
  }
  if (config.inputFiles !== undefined && (
    !Array.isArray(config.inputFiles)
    || config.inputFiles.some((filePath) => typeof filePath !== 'string' || filePath.trim() === '')
  )) {
    throw configError('"inputFiles" must be an array of non-empty strings.')
  }
  if (config.transform !== undefined) {
    if (
      config.transform === null
      || typeof config.transform !== 'object'
      || Array.isArray(config.transform)
    ) {
      throw configError('"transform" must be an object.')
    }

    const transform = config.transform as Record<string, unknown>
    for (const field of Object.keys(transform)) {
      if (!TRANSFORM_FIELDS.has(field)) {
        throw configError(`unknown field "transform.${field}".`)
      }
    }
    for (const option of ['removeSize', 'replaceColors', 'addTransition']) {
      if (transform[option] !== undefined && typeof transform[option] !== 'boolean') {
        throw configError(`"transform.${option}" must be a boolean.`)
      }
    }
  }
  if (config.generatedNotice !== undefined && typeof config.generatedNotice !== 'boolean') {
    throw configError('"generatedNotice" must be a boolean.')
  }
}

function getModuleDefault(value: unknown, configPath: string): unknown {
  if (!value || typeof value !== 'object' || !('default' in value)) {
    throw new Error(
      `Sprite config file must have a default export: ${configPath}\n`
      + 'Use: export default defineSpriteConfig({ ... })',
    )
  }
  return (value as { default: unknown }).default
}

/** Загружает явно указанный JS, JSON или TS config-файл. */
export async function loadSpriteConfig(configFile: string): Promise<SpriteConfig> {
  const configPath = path.resolve(configFile)
  const extension = path.extname(configPath).toLowerCase()

  if (!CONFIG_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported sprite config extension: ${extension || '(none)'}. Supported: .js, .json, .ts.`)
  }
  if (!fs.existsSync(configPath) || !fs.statSync(configPath).isFile()) {
    throw new Error(`Sprite config file does not exist: ${configPath}`)
  }

  let config: unknown
  if (extension === '.json') {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new Error(`Cannot parse sprite config: ${configPath}\n${reason}`)
    }
  } else {
    const jiti = createJiti(path.dirname(configPath))
    config = getModuleDefault(await jiti.import(configPath), configPath)
  }

  validateSpriteConfig(config)
  return config
}

/** Разрешает позиционный путь как config-файл либо config-less корень модуля. */
export async function resolveSpriteConfigSource(source: string): Promise<SpriteConfigSource> {
  const resolved = path.resolve(source)

  if (!fs.existsSync(resolved)) {
    throw new Error(`Sprite config or module directory does not exist: ${resolved}`)
  }

  const stats = fs.statSync(resolved)
  if (stats.isDirectory()) {
    return { rootDir: resolved, configPath: null, config: {} }
  }
  if (!stats.isFile()) {
    throw new Error(`Sprite config path must be a file or directory: ${resolved}`)
  }

  return {
    rootDir: path.dirname(resolved),
    configPath: resolved,
    config: await loadSpriteConfig(resolved),
  }
}

function definedEntries<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>
}

/** Объединяет defaults, config и overrides и разрешает пути от корня модуля. */
export function resolveSpriteConfig(
  rootDir: string,
  config: SpriteConfig = {},
  overrides: SpriteConfig = {},
): ResolvedSpriteConfig {
  validateSpriteConfig(config)
  validateSpriteConfig(overrides)

  const configValues = definedEntries(config)
  const overrideValues = definedEntries(overrides)
  const transform: TransformOptions = {
    ...config.transform,
    ...overrides.transform,
  }
  const merged: SpriteConfig = {
    ...configValues,
    ...overrideValues,
    transform,
  }

  if (!merged.mode) {
    throw new Error('Sprite mode is required. Set "mode" in the config or pass it through CLI/API.')
  }

  const name = merged.name ?? getDefaultName(rootDir)
  validateSpriteName(name)
  const inputFiles = (merged.inputFiles ?? []).map((filePath) => path.resolve(rootDir, filePath))
  const defaultInputFolder = path.resolve(rootDir, 'icons')
  const inputFolder = merged.inputFolder === undefined
    && inputFiles.length > 0
    && !fs.existsSync(defaultInputFolder)
    ? null
    : path.resolve(rootDir, merged.inputFolder ?? 'icons')

  return {
    mode: merged.mode,
    name,
    description: merged.description,
    inputFolder,
    inputFiles,
    transform: {
      removeSize: transform.removeSize ?? true,
      replaceColors: transform.replaceColors ?? true,
      addTransition: transform.addTransition ?? true,
    },
    generatedNotice: merged.generatedNotice ?? true,
  }
}
