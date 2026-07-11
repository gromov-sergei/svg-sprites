import fs from 'node:fs'
import path from 'node:path'
import { createJiti } from 'jiti'
import { toKebabCase, validateSpriteName } from './naming.js'
import type { ReactSpriteConfig, ResolvedReactSpriteConfig } from './types.js'

export const REACT_CONFIG_FILE = 'svg-sprite.config.ts'

function getDefaultName(rootDir: string): string {
  const rootName = path.basename(rootDir)
  const source = rootName === 'svg-sprite' || rootName === 'svg-sprites'
    ? path.basename(path.dirname(rootDir))
    : rootName
  const name = toKebabCase(source)

  if (!name) {
    throw new Error(`Cannot infer sprite name from directory: ${rootDir}`)
  }

  return name
}

/** Загружает локальный React-конфиг из корня sprite-модуля. */
export async function loadReactSpriteConfig(rootDir: string): Promise<ResolvedReactSpriteConfig> {
  const configPath = path.join(rootDir, REACT_CONFIG_FILE)

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `React config file not found: ${configPath}\n` +
      `Create ${REACT_CONFIG_FILE} inside the sprite directory.`,
    )
  }

  const jiti = createJiti(rootDir)
  const mod = await jiti.import(configPath) as { default?: ReactSpriteConfig }
  const config = mod.default

  if (!config || typeof config !== 'object') {
    throw new Error(
      `React config file must have a default export: ${configPath}\n` +
      'Use: export default defineReactSpriteConfig({ ... })',
    )
  }

  if (config.name !== undefined && typeof config.name !== 'string') {
    throw new Error('React config: "name" must be a string.')
  }

  if (config.description !== undefined && typeof config.description !== 'string') {
    throw new Error('React config: "description" must be a string.')
  }

  if ('icons' in config) {
    throw new Error('React config: "icons" was renamed to "inputFolder".')
  }

  if (config.inputFolder !== undefined && (
    typeof config.inputFolder !== 'string' || config.inputFolder.trim() === ''
  )) {
    throw new Error('React config: "inputFolder" must be a non-empty string.')
  }

  if (config.inputFiles !== undefined && (
    !Array.isArray(config.inputFiles)
    || config.inputFiles.some((filePath) => typeof filePath !== 'string' || filePath.trim() === '')
  )) {
    throw new Error('React config: "inputFiles" must be an array of non-empty strings.')
  }

  if (config.transform !== undefined) {
    if (
      config.transform === null
      || typeof config.transform !== 'object'
      || Array.isArray(config.transform)
    ) {
      throw new Error('React config: "transform" must be an object.')
    }

    for (const option of ['removeSize', 'replaceColors', 'addTransition'] as const) {
      if (config.transform[option] !== undefined && typeof config.transform[option] !== 'boolean') {
        throw new Error(`React config: "transform.${option}" must be a boolean.`)
      }
    }
  }

  if (config.generatedNotice !== undefined && typeof config.generatedNotice !== 'boolean') {
    throw new Error('React config: "generatedNotice" must be a boolean.')
  }

  const name = config.name ?? getDefaultName(rootDir)
  validateSpriteName(name)
  const inputFiles = (config.inputFiles ?? []).map((filePath) => path.resolve(rootDir, filePath))
  const defaultInputFolder = path.resolve(rootDir, 'icons')
  const inputFolder = config.inputFolder === undefined
    && inputFiles.length > 0
    && !fs.existsSync(defaultInputFolder)
    ? null
    : path.resolve(rootDir, config.inputFolder ?? 'icons')

  return {
    name,
    description: config.description,
    inputFolder,
    inputFiles,
    transform: { ...config.transform },
    generatedNotice: config.generatedNotice ?? true,
  }
}
