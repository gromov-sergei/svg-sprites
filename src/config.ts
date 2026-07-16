import fs from 'node:fs'
import path from 'node:path'
import { createJiti } from 'jiti'
import { toKebabCase, validateSpriteName } from './core/naming.js'
import type { SpriteMode } from './targets/types.js'
import type {
  ResolvedSpriteConfig,
  ServerSvgInput,
  SpriteConfig,
  SpriteInput,
  SpriteSource,
  TransformOptions,
} from './types.js'

const CONFIG_EXTENSIONS = new Set(['.js', '.json', '.ts'])
const CONFIG_FIELDS = new Set([
  'mode',
  'source',
  'name',
  'description',
  'input',
  'transform',
  'generatedNotice',
])
const TRANSFORM_FIELDS = new Set(['removeSize', 'replaceColors', 'addTransition'])
const MODES = new Set<SpriteMode>([
  'standalone',
  'standalone@vite',
  'standalone@webpack',
  'standalone@server',
  'react@vite',
  'react@webpack',
  'vue@vite',
  'vue@webpack',
  'nuxt@vite',
  'nuxt@webpack',
  'svelte@vite',
  'svelte@webpack',
  'sveltekit@vite',
  'angular@application',
  'angular@webpack',
  'astro@vite',
  'solid@vite',
  'solid@webpack',
  'solid-start@vite',
  'preact@vite',
  'preact@webpack',
  'qwik@vite',
  'lit@vite',
  'lit@webpack',
  'alpine@vite',
  'alpine@webpack',
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

function isServerSvgInput(value: unknown): value is ServerSvgInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const input = value as Record<string, unknown>
  if (Object.keys(input).some((field) => !['name', 'url', 'sha256'].includes(field))) return false
  return typeof input.name === 'string'
    && input.name.trim() !== ''
    && !/[\\/]/.test(input.name)
    && !input.name.endsWith('.svg')
    && typeof input.url === 'string'
    && input.url.trim() !== ''
    && (input.sha256 === undefined || (typeof input.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(input.sha256)))
}

function inputEntries(input: unknown): unknown[] {
  return Array.isArray(input) ? input : [input]
}

function validateInput(config: Record<string, unknown>): void {
  if (config.input === undefined) return

  const entries = inputEntries(config.input)
  if (entries.length === 0) {
    throw configError('"input" must be a non-empty string or an array of non-empty strings.')
  }

  if (config.source === 'remote') {
    if (typeof config.input !== 'string' || config.input.trim() === '') {
      throw configError('remote "input" must be one manifest path or HTTP(S) URL.')
    }
    return
  }

  if (config.mode === 'standalone@server') {
    if (entries.some((entry) => (
      typeof entry === 'string' ? entry.trim() === '' : !isServerSvgInput(entry)
    ))) {
      throw configError('standalone@server "input" must contain local paths/globs or { name, url, sha256? } entries.')
    }
    return
  }

  if (entries.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw configError('"input" must be a non-empty string or an array of non-empty strings.')
  }
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
  if ('inputFolder' in config || 'inputFiles' in config) {
    throw configError('"inputFolder" and "inputFiles" are no longer supported. Use "input".')
  }
  for (const field of Object.keys(config)) {
    if (!CONFIG_FIELDS.has(field)) throw configError(`unknown field "${field}".`)
  }
  if (config.mode !== undefined && !isSpriteMode(config.mode)) {
    throw configError(`unsupported "mode": ${String(config.mode)}.`)
  }
  if (config.source !== undefined && config.source !== 'local' && config.source !== 'remote') {
    throw configError('"source" must be "local" or "remote".')
  }
  if (config.mode === 'standalone@server' && config.source === 'remote') {
    throw configError('standalone@server cannot consume a remote manifest.')
  }
  if (config.source === 'remote') {
    for (const field of ['name', 'description', 'transform', 'generatedNotice']) {
      if (field in config) throw configError(`remote config does not support "${field}".`)
    }
  }
  if (config.name !== undefined && typeof config.name !== 'string') {
    throw configError('"name" must be a string.')
  }
  if (config.description !== undefined && typeof config.description !== 'string') {
    throw configError('"description" must be a string.')
  }
  validateInput(config)
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

  const configValues = definedEntries(config) as Record<string, unknown>
  const overrideValues = definedEntries(overrides) as Record<string, unknown>
  const source = (overrideValues.source ?? configValues.source ?? 'local') as SpriteSource
  const sourceChangedByOverride = overrideValues.source !== undefined && overrideValues.source !== configValues.source
  if (sourceChangedByOverride && overrideValues.input === undefined) {
    throw new Error('Changing "source" through overrides also requires an "input" override.')
  }
  const transform: TransformOptions = {
    ...(source === 'remote' ? {} : config.transform),
    ...(source === 'remote' ? {} : overrides.transform),
  }
  const merged = {
    ...configValues,
    ...overrideValues,
    source,
    transform,
  } as Record<string, unknown>

  if (!merged.mode || !isSpriteMode(merged.mode)) {
    throw new Error('Sprite mode is required. Set "mode" in the config or pass it through CLI/API.')
  }
  if (source === 'remote' && merged.mode === 'standalone@server') {
    throw new Error('Mode "standalone@server" cannot consume a remote manifest.')
  }

  const name = source === 'remote' ? getDefaultName(rootDir) : (merged.name as string | undefined) ?? getDefaultName(rootDir)
  validateSpriteName(name)
  const configuredInput = (merged.input ?? 'icons') as SpriteInput | SpriteInput[]
  const input = (Array.isArray(configuredInput) ? configuredInput : [configuredInput])
    .map((entry) => {
      if (typeof entry !== 'string') return entry
      if (source === 'remote' && /^https?:\/\//i.test(entry)) return entry
      const negated = entry.startsWith('!')
      const resolved = path.resolve(rootDir, negated ? entry.slice(1) : entry)
      const normalized = path.sep === '/' ? resolved : resolved.replaceAll(path.sep, '/')
      return negated ? `!${normalized}` : normalized
    })

  return {
    mode: merged.mode,
    source,
    name,
    description: source === 'remote' ? undefined : merged.description as string | undefined,
    input,
    transform: {
      removeSize: transform.removeSize ?? true,
      replaceColors: transform.replaceColors ?? true,
      addTransition: transform.addTransition ?? true,
    },
    generatedNotice: source === 'remote' ? true : (merged.generatedNotice as boolean | undefined) ?? true,
  }
}
