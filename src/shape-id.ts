import { createHash } from 'node:crypto'
import path from 'node:path'

/** Возвращает стабильный и безопасный fragment ID для исходного SVG-файла. */
export function getSpriteShapeId(filePath: string): string {
  const iconName = path.basename(filePath, '.svg')

  if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(iconName)) {
    return iconName
  }

  const hash = createHash('sha256').update(iconName).digest('hex').slice(0, 16)
  return `icon-${hash}`
}
