import fs from 'node:fs'
import path from 'node:path'
import type { SpriteFolder } from './types.js'

/**
 * Сканирует папку и возвращает отсортированные абсолютные пути к SVG-файлам.
 */
function scanDirectory(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Input directory does not exist: ${dirPath}`)
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.svg'))
    .sort()
    .map((file) => path.join(dirPath, file))
}

/**
 * Резолвит массив путей к SVG-файлам в абсолютные пути.
 * Проверяет существование каждого файла.
 */
function resolveFiles(files: string[]): string[] {
  return files.map((filePath) => {
    const resolved = path.resolve(filePath)

    if (!fs.existsSync(resolved)) {
      throw new Error(`SVG file does not exist: ${resolved}`)
    }

    if (!resolved.endsWith('.svg')) {
      throw new Error(`File is not an SVG: ${resolved}`)
    }

    return resolved
  })
}

type ResolveSpriteSourcesOptions = {
  name: string
  format: SpriteFolder['format']
  inputFolder: string | null
  inputFiles: string[]
}

/** Объединяет SVG из папки и явного списка в один источник спрайта. */
export function resolveSpriteSources(options: ResolveSpriteSourcesOptions): SpriteFolder {
  const { name, format, inputFolder, inputFiles } = options
  const folderFiles = inputFolder === null ? [] : scanDirectory(inputFolder)
  const files = [...new Set([...folderFiles, ...resolveFiles(inputFiles)])]

  if (files.length === 0) {
    throw new Error(`Sprite "${name}" has no SVG files in configured inputs.`)
  }

  return {
    name,
    format,
    path: inputFolder,
    files,
  }
}
