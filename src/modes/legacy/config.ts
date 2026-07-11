import fs from 'node:fs'
import path from 'node:path'
import { createJiti } from 'jiti'
import type { SvgSpritesConfig } from '../../types.js'

const CONFIG_NAME = 'svg-sprites.config'

/** Загружает legacy-конфиг из указанной директории. */
export async function loadLegacyConfig(cwd: string = process.cwd()): Promise<SvgSpritesConfig> {
  const configPath = path.join(cwd, `${CONFIG_NAME}.ts`)

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config file not found: ${configPath}\n` +
      `Create a ${CONFIG_NAME}.ts file in the project root.`,
    )
  }

  const jiti = createJiti(cwd)
  const mod = await jiti.import(configPath) as { default?: SvgSpritesConfig }
  const config = mod.default

  if (!config) {
    throw new Error(
      `Config file must have a default export: ${configPath}\n` +
      'Use: export default defineLegacyConfig({ ... })',
    )
  }

  validateLegacyConfig(config)
  return {
    ...config,
    output: path.resolve(cwd, config.output),
    sprites: config.sprites.map((sprite) => ({
      ...sprite,
      input: Array.isArray(sprite.input)
        ? sprite.input.map((filePath) => path.resolve(cwd, filePath))
        : path.resolve(cwd, sprite.input),
    })),
  }
}

/** Валидирует legacy-конфиг. */
export function validateLegacyConfig(config: SvgSpritesConfig): void {
  if (!config.output) {
    throw new Error('Config: "output" is required.')
  }

  if (!config.sprites || config.sprites.length === 0) {
    throw new Error('Config: "sprites" must be a non-empty array.')
  }

  for (const sprite of config.sprites) {
    if ('mode' in sprite) {
      throw new Error(
        `Config: sprite "${sprite.name}" uses deprecated "mode". Use "format" instead.`,
      )
    }

    if (!sprite.name) {
      throw new Error('Config: each sprite must have a "name".')
    }

    if (!sprite.input) {
      throw new Error(`Config: sprite "${sprite.name}" must have an "input".`)
    }

    if (sprite.format && sprite.format !== 'stack' && sprite.format !== 'symbol') {
      throw new Error(
        `Config: sprite "${sprite.name}" has invalid format "${sprite.format}". Supported: stack, symbol.`,
      )
    }
  }
}
