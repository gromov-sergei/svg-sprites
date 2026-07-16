import fs from 'node:fs'
import path from 'node:path'
import SVGSpriter from 'svg-sprite'
import { getSpriteShapeId } from './shape-id.js'
import { createShapeTransform } from './transforms.js'
import type { SpriteFolder, SpriteFormat, TransformOptions } from './types.js'

export type CompileSpriteOptions = {
  /** Добавлять вычисленный viewBox корневому stack-спрайту. */
  rootViewBox?: boolean
}

export type SpriteSourceContent = {
  readonly name: string
  readonly content: string
}

/** Конфигурация режима для svg-sprite. */
function getModeConfig(
  format: SpriteFormat,
  destDir: string,
  name: string,
  options: CompileSpriteOptions,
) {
  return {
    dest: destDir,
    sprite: `${name}.sprite.svg`,
    example: false,
    rootviewbox: options.rootViewBox ?? false,
  }
}

/** Строит массив shape.transform. */
function buildShapeTransforms(transform: TransformOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transforms: any[] = [
    {
      svgo: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      },
    },
    createShapeTransform(transform),
  ]

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
  options: CompileSpriteOptions = {},
): Promise<string> {
  const contents = await compileSpriteContent(folder, transform, options)
  const spritePath = path.join(outputDir, `${folder.name}.sprite.svg`)

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(spritePath, contents)

  return spritePath
}

/** Компилирует SVG-спрайт в памяти, не изменяя файловую систему. */
export async function compileSpriteContent(
  folder: SpriteFolder,
  transform: TransformOptions = {},
  options: CompileSpriteOptions = {},
): Promise<Uint8Array> {
  const sources = folder.files.map((filePath) => ({
    name: path.basename(filePath, '.svg'),
    content: fs.readFileSync(filePath, 'utf-8'),
  }))
  return compileSpriteSourceContent(folder.name, folder.format, sources, transform, options)
}

/** Компилирует SVG sources из памяти без промежуточных файлов. */
export async function compileSpriteSourceContent(
  name: string,
  format: SpriteFormat,
  sources: readonly SpriteSourceContent[],
  transform: TransformOptions = {},
  options: CompileSpriteOptions = {},
): Promise<Uint8Array> {
  const config = {
    shape: {
      id: {
        generator: (filePath: string) => getSpriteShapeId(filePath),
      },
      dimension: {
        attributes: transform.removeSize === false,
      },
      transform: buildShapeTransforms(transform),
    },
    mode: {
      [format]: getModeConfig(format, '.', name, options),
    },
  }

  const spriter = new SVGSpriter(config)

  for (const source of sources) {
    spriter.add(`${source.name}.svg`, null, source.content)
  }

  return new Promise((resolve, reject) => {
    spriter.compile((error, result) => {
      if (error) {
        reject(error)
        return
      }

      let spriteContents: Uint8Array | undefined

      for (const modeResult of Object.values(result)) {
        for (const resource of Object.values(
          modeResult as Record<string, { path: string; contents: Uint8Array }>,
        )) {
          if (resource.path.endsWith('.svg')) {
            spriteContents = resource.contents
          }
        }
      }

      if (!spriteContents) {
        reject(new Error(`Failed to compile sprite "${name}".`))
        return
      }

      resolve(spriteContents)
    })
  })
}
