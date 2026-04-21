import fs from 'node:fs'
import path from 'node:path'
import SVGSpriter from 'svg-sprite'
import { createShapeTransform } from './transforms.js'
import type { SpriteFolder, SpriteMode, TransformOptions } from './types.js'

/** Конфигурация режима для svg-sprite. */
function getModeConfig(mode: SpriteMode, destDir: string) {
  return {
    dest: destDir,
    sprite: `sprite.${mode}.svg`,
    example: false,
    rootviewbox: false,
  }
}

/** Строит массив shape.transform на основе опций. */
function buildShapeTransforms(transform: TransformOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transforms: any[] = ['svgo']

  const hasCustomTransform =
    transform.removeSize !== false ||
    transform.replaceColors !== false ||
    transform.addTransition !== false

  if (hasCustomTransform) {
    transforms.push(createShapeTransform(transform))
  }

  return transforms
}

/**
 * Компилирует папку с SVG-файлами в спрайт.
 *
 * Возвращает путь к сгенерированному SVG-файлу.
 */
export async function compileSprite(
  folder: SpriteFolder,
  outputDir: string,
  transform: TransformOptions = {},
): Promise<string> {
  const destDir = path.join(outputDir, folder.name)

  const config = {
    shape: {
      transform: buildShapeTransforms(transform),
    },
    mode: {
      [folder.mode]: getModeConfig(folder.mode, destDir),
    },
  }

  const spriter = new SVGSpriter(config)

  for (const filePath of folder.files) {
    spriter.add(filePath, null, fs.readFileSync(filePath, 'utf-8'))
  }

  return new Promise((resolve, reject) => {
    spriter.compile((error, result) => {
      if (error) {
        reject(error)
        return
      }

      let spritePath = ''

      for (const modeResult of Object.values(result)) {
        for (const resource of Object.values(
          modeResult as Record<string, { path: string; contents: Buffer }>,
        )) {
          fs.mkdirSync(path.dirname(resource.path), { recursive: true })
          fs.writeFileSync(resource.path, resource.contents)
          if (resource.path.endsWith('.svg')) {
            spritePath = resource.path
          }
        }
      }

      resolve(spritePath)
    })
  })
}
