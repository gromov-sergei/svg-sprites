import fs from 'node:fs'
import path from 'node:path'
import { createJiti } from 'jiti'
import type { SvgSpritesConfig } from './types.js'

const CONFIG_NAME = 'svg-sprites.config'

/**
 * Загружает конфиг svg-sprites.config.ts из указанной директории.
 *
 * Использует jiti для импорта TypeScript-файлов.
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<SvgSpritesConfig> {
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
      'Use: export default defineConfig({ ... })',
    )
  }

  validateConfig(config)

  return config
}

/**
 * Валидирует конфиг на наличие обязательных полей.
 */
function validateConfig(config: SvgSpritesConfig): void {
  if (!config.output) {
    throw new Error('Config: "output" is required.')
  }

  if (!config.sprites || config.sprites.length === 0) {
    throw new Error('Config: "sprites" must be a non-empty array.')
  }

  for (const sprite of config.sprites) {
    if (!sprite.name) {
      throw new Error('Config: each sprite must have a "name".')
    }

    if (!sprite.input) {
      throw new Error(`Config: sprite "${sprite.name}" must have an "input".`)
    }

    if (sprite.mode && sprite.mode !== 'stack' && sprite.mode !== 'symbol') {
      throw new Error(
        `Config: sprite "${sprite.name}" has invalid mode "${sprite.mode}". Supported: stack, symbol.`,
      )
    }
  }
}
