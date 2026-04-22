import fs from 'node:fs'
import path from 'node:path'
import type { SpriteEntry, SpriteFolder } from './types.js'

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

/**
 * Преобразует SpriteEntry из конфига в SpriteFolder для компиляции.
 */
export function resolveSpriteEntry(entry: SpriteEntry): SpriteFolder {
  const mode = entry.mode ?? 'stack'

  if (Array.isArray(entry.input)) {
    const files = resolveFiles(entry.input)

    if (files.length === 0) {
      throw new Error(`Sprite "${entry.name}" has empty input array.`)
    }

    return {
      name: entry.name,
      mode,
      path: null,
      files,
    }
  }

  const dirPath = path.resolve(entry.input)
  const files = scanDirectory(dirPath)

  if (files.length === 0) {
    throw new Error(`Sprite "${entry.name}" has no SVG files in "${dirPath}".`)
  }

  return {
    name: entry.name,
    mode,
    path: dirPath,
    files,
  }
}

/**
 * Преобразует массив SpriteEntry из конфига в массив SpriteFolder.
 */
export function resolveSprites(entries: SpriteEntry[]): SpriteFolder[] {
  return entries.map(resolveSpriteEntry)
}
