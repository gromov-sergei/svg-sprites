import fs from 'node:fs'
import path from 'node:path'
import type { SpriteFolder } from './types.js'

/** Преобразует kebab-case строку в PascalCase. */
function toPascalCase(str: string): string {
  return str.replace(/(^|[-_])([a-z])/g, (_, __, c: string) => c.toUpperCase())
}

/**
 * Генерирует .generated.ts файл с union-типом имён иконок спрайта.
 *
 * Возвращает путь к сгенерированному файлу.
 */
export function generateIconTypes(
  folder: SpriteFolder,
  outputDir: string,
): string {
  const names = folder.files
    .map((filePath) => path.basename(filePath, '.svg'))
    .sort()

  const typeName = `${toPascalCase(folder.name)}IconName`

  const content = [
    '/**',
    ` * Icon names for the "${folder.name}" sprite.`,
    ' * @generated — this file is auto-generated, do not edit manually.',
    ' */',
    `export type ${typeName} =`,
    names.map((name) => `  | '${name}'`).join('\n'),
    '',
  ].join('\n')

  const outputPath = path.join(outputDir, `${folder.name}.generated.ts`)

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, content)

  return outputPath
}
