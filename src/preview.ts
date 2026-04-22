import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SpriteResult } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Извлекает id иконок из SVG-спрайта. */
function extractIconIds(spritePath: string): string[] {
  const content = fs.readFileSync(spritePath, 'utf-8')
  const ids: string[] = []
  const regex = /<(?:svg|symbol)\b[^>]*\bid="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1])
  }
  return ids.sort()
}

/** Извлекает CSS-переменные var(--icon-color-N, fallback) из SVG-фрагмента иконки. */
function extractIconVars(svgFragment: string): { varName: string; fallback: string }[] {
  const vars = new Map<string, string>()
  const regex = /var\((--icon-color-\d+),\s*([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(svgFragment)) !== null) {
    if (!vars.has(match[1])) {
      vars.set(match[1], match[2].trim())
    }
  }
  return [...vars.entries()].map(([varName, fallback]) => ({ varName, fallback }))
}

/** Парсит SVG-спрайт и возвращает маппинг id → SVG-фрагмент. */
function extractIconFragments(spritePath: string): Map<string, string> {
  const content = fs.readFileSync(spritePath, 'utf-8')
  const fragments = new Map<string, string>()
  const regex = /<(?:svg|symbol)\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/(?:svg|symbol)>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    fragments.set(match[1], match[0])
  }
  return fragments
}

/** Извлекает viewBox из SVG-фрагмента иконки. */
function extractViewBox(svgFragment: string): { x: number; y: number; width: number; height: number } | null {
  const match = svgFragment.match(/viewBox="([^"]+)"/)
  if (!match) return null
  const parts = match[1].split(/\s+/).map(Number)
  if (parts.length !== 4) return null
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] }
}

/** Конвертирует CSS-цвет в hex. */
function colorToHex(color: string): string {
  const named: Record<string, string> = {
    red: '#ff0000', blue: '#0000ff', green: '#008000', white: '#ffffff',
    black: '#000000', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080',
    grey: '#808080', currentcolor: '#000000',
  }
  const lower = color.toLowerCase().trim()
  if (lower.startsWith('#')) {
    if (lower.length === 4) return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`
    return lower
  }
  return named[lower] || '#000000'
}

/** Подготавливает SVG-спрайт для инлайна — конвертирует вложенные <svg> в <symbol>. */
function prepareInlineSprite(spritePath: string): string {
  let content = fs.readFileSync(spritePath, 'utf-8')
  content = content.replace(/<\?xml[^?]*\?>\s*/g, '')
  content = content.replace(/<style>:root>svg\{display:none\}:root>svg:target\{display:block\}<\/style>/g, '')

  let depth = 0
  content = content.replace(/<(\/?)svg\b([^>]*?)(\s*\/?)>/g, (_full, slash: string, attrs: string) => {
    if (slash) {
      depth--
      return depth > 0 ? '</symbol>' : '</svg>'
    }
    depth++
    if (depth > 1) {
      const cleanAttrs = attrs.replace(/\s*xmlns="[^"]*"/g, '')
      return `<symbol${cleanAttrs}>`
    }
    return `<svg${attrs} style="display:none">`
  })
  return content
}

interface IconData {
  id: string
  group: string
  mode: string
  spriteFile: string
  viewBox: { x: number; y: number; width: number; height: number } | null
  vars: { varName: string; fallback: string; hex: string; isCurrentColor: boolean }[]
}

interface SpriteGroup {
  name: string
  mode: string
  spriteFile: string
  icons: IconData[]
}

/**
 * Генерирует HTML-файл превью для всех спрайтов.
 *
 * Использует pre-built React-приложение из dist/preview-template.html,
 * инжектирует данные спрайтов и inline SVG.
 */
export function generatePreview(
  results: SpriteResult[],
  outputDir: string,
): string {
  // Собираем данные
  const groups: SpriteGroup[] = results.map((r) => {
    const fragments = extractIconFragments(r.spritePath)
    const ids = extractIconIds(r.spritePath)
    const spriteFile = `${r.name}.sprite.svg`

    const icons: IconData[] = ids.map((id) => {
      const fragment = fragments.get(id) || ''
      return {
        id,
        group: r.name,
        mode: r.mode,
        spriteFile,
        viewBox: extractViewBox(fragment),
        vars: extractIconVars(fragment).map((v) => ({
          varName: v.varName,
          fallback: v.fallback,
          hex: colorToHex(v.fallback),
          isCurrentColor: v.fallback.toLowerCase() === 'currentcolor',
        })),
      }
    })

    return { name: r.name, mode: r.mode, spriteFile, icons }
  })

  // Inline SVG спрайтов
  const inlineSprites = results
    .map((r) => prepareInlineSprite(r.spritePath))
    .join('\n')

  // Скрипт с данными + DOM injection
  const svgEscaped = inlineSprites.replace(/`/g, '\\`').replace(/\$/g, '\\$')
  const dataScript = [
    '<script>',
    `window.__SPRITES_DATA__ = ${JSON.stringify({ groups })};`,
    '(function() {',
    `  var svg = \`${svgEscaped}\`;`,
    '  var parser = new DOMParser();',
    '  var doc = parser.parseFromString("<div>" + svg + "</div>", "text/html");',
    '  var nodes = doc.body.firstChild.childNodes;',
    '  while (nodes.length > 0) {',
    '    document.body.insertBefore(nodes[0], document.body.firstChild);',
    '  }',
    '})();',
    '</script>',
  ].join('\n')

  // Читаем шаблон
  const templatePath = path.join(__dirname, 'preview-template.html')

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Preview template not found: ${templatePath}\n` +
      'Run "npm run build" in the preview/ directory first.',
    )
  }

  let html = fs.readFileSync(templatePath, 'utf-8')
  html = html.replace('<!-- __SPRITES_INJECT__ -->', dataScript)

  // Записываем результат
  const outputPath = path.join(outputDir, 'preview.html')
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, html)

  return outputPath
}
