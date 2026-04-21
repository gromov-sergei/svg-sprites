import fs from 'node:fs'
import path from 'node:path'
import type { SpriteFolder, SpriteMode } from './types.js'

/**
 * Парсит имя папки и извлекает режим спрайта.
 *
 * Формат: `folder-name` → stack (по умолчанию), `folder-name?symbol` → symbol.
 */
function parseFolderName(fullName: string): { name: string; mode: SpriteMode } {
  const hasCustomMode = fullName.includes('?')
  if (!hasCustomMode) {
    return { name: fullName, mode: 'stack' }
  }

  const parts = fullName.split('?')
  const mode = parts.pop() as SpriteMode
  const name = parts[0]

  if (mode !== 'stack' && mode !== 'symbol') {
    throw new Error(
      `Unknown sprite mode "${mode}" in folder "${fullName}". Supported: stack, symbol.`,
    )
  }

  return { name, mode }
}

/**
 * Сканирует директорию и возвращает список папок-спрайтов с их SVG-файлами.
 *
 * Пропускает записи, не являющиеся директориями, и папки без SVG-файлов.
 */
export function scanSpriteFolders(inputDir: string): SpriteFolder[] {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`)
  }

  const entries = fs.readdirSync(inputDir)
  const folders: SpriteFolder[] = []

  for (const entry of entries) {
    const fullPath = path.join(inputDir, entry)

    if (!fs.lstatSync(fullPath).isDirectory()) {
      continue
    }

    const svgFiles = fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith('.svg'))
      .sort()
      .map((file) => path.join(fullPath, file))

    if (svgFiles.length === 0) {
      continue
    }

    const { name, mode } = parseFolderName(entry)

    folders.push({
      fullName: entry,
      name,
      mode,
      path: fullPath,
      files: svgFiles,
    })
  }

  return folders
}
