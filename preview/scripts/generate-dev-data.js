/**
 * Генерирует dev-данные для preview из реальных спрайтов основного пакета.
 *
 * Запуск: node scripts/generate-dev-data.js
 *
 * Результат:
 *   public/dev-data.js    — window.__SPRITES_DATA__ с метаданными иконок
 *   public/dev-sprites.svg — инлайновые <symbol> из всех спрайтов
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../..')
const SPRITES_OUTPUT = path.join(ROOT, 'preview/public')
const PREVIEW_PUBLIC = path.join(import.meta.dirname, '../public')

/** Извлекает id иконок из SVG-спрайта. */
function extractIconIds(spritePath) {
  const content = fs.readFileSync(spritePath, 'utf-8')
  const ids = []
  const regex = /<(?:svg|symbol)\b[^>]*\bid="([^"]+)"/g
  let match
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1])
  }
  return ids.sort()
}

/** Извлекает viewBox из SVG-фрагмента иконки. */
function extractViewBox(svgFragment) {
  const match = svgFragment.match(/viewBox="([^"]+)"/)
  if (!match) return null
  const parts = match[1].split(/\s+/).map(Number)
  if (parts.length !== 4) return null
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] }
}

/** Извлекает CSS-переменные из SVG-фрагмента иконки. */
function extractIconVars(svgFragment) {
  const vars = new Map()
  const regex = /var\((--icon-color-\d+),\s*([^)]+)\)/g
  let match
  while ((match = regex.exec(svgFragment)) !== null) {
    if (!vars.has(match[1])) {
      vars.set(match[1], match[2].trim())
    }
  }
  return [...vars.entries()].map(([varName, fallback]) => ({
    varName,
    fallback,
    hex: colorToHex(fallback),
    isCurrentColor: fallback.toLowerCase() === 'currentcolor',
  }))
}

/** Извлекает фрагменты иконок из спрайта. */
function extractIconFragments(spritePath) {
  const content = fs.readFileSync(spritePath, 'utf-8')
  const fragments = new Map()
  const regex = /<(?:svg|symbol)\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/(?:svg|symbol)>/g
  let match
  while ((match = regex.exec(content)) !== null) {
    fragments.set(match[1], match[0])
  }
  return fragments
}

/** Конвертирует CSS-цвет в hex. */
function colorToHex(color) {
  const named = {
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

/** Подготавливает спрайт для инлайна — вложенные <svg> → <symbol>. */
function prepareInlineSprite(spritePath) {
  let content = fs.readFileSync(spritePath, 'utf-8')
  content = content.replace(/<\?xml[^?]*\?>\s*/g, '')
  content = content.replace(/<style>:root>svg\{display:none\}:root>svg:target\{display:block\}<\/style>/g, '')

  let depth = 0
  content = content.replace(/<(\/?)svg\b([^>]*?)(\s*\/?)>/g, (_full, slash, attrs) => {
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

// --- Main ---
const spriteFiles = fs.readdirSync(SPRITES_OUTPUT).filter((entry) => {
  return entry.endsWith('.sprite.svg')
})

const groups = []
const inlineSprites = []

for (const fileName of spriteFiles) {
  const spritePath = path.join(SPRITES_OUTPUT, fileName)
  const name = fileName.replace('.sprite.svg', '')

  const fragments = extractIconFragments(spritePath)
  const ids = extractIconIds(spritePath)

  const icons = ids.map((id) => {
    const fragment = fragments.get(id) || ''
    return {
      id,
      group: name,
      mode: 'stack',
      spriteFile: fileName,
      viewBox: extractViewBox(fragment),
      vars: extractIconVars(fragment),
    }
  })

  groups.push({ name, mode: 'stack', spriteFile: fileName, icons })
  inlineSprites.push(prepareInlineSprite(spritePath))
}

// Write dev-data.js — данные + инлайн-спрайты через DOM injection
fs.mkdirSync(PREVIEW_PUBLIC, { recursive: true })

const svgContent = inlineSprites.join('\n').replace(/`/g, '\\`').replace(/\$/g, '\\$')

const dataJs = [
  `window.__SPRITES_DATA__ = ${JSON.stringify({ groups }, null, 2)};`,
  '',
  '// Inject inline SVG sprites into DOM via DOMParser for correct SVG namespace',
  '(function() {',
  `  var svg = \`${svgContent}\`;`,
  '  var parser = new DOMParser();',
  '  var doc = parser.parseFromString("<div>" + svg + "</div>", "text/html");',
  '  var nodes = doc.body.firstChild.childNodes;',
  '  while (nodes.length > 0) {',
  '    document.body.insertBefore(nodes[0], document.body.firstChild);',
  '  }',
  '})();',
].join('\n')

fs.writeFileSync(path.join(PREVIEW_PUBLIC, 'dev-data.js'), dataJs)

// Cleanup old separate file if exists
const oldSvg = path.join(PREVIEW_PUBLIC, 'dev-sprites.svg')
if (fs.existsSync(oldSvg)) fs.unlinkSync(oldSvg)

console.log(`Generated dev data: ${groups.length} groups, ${groups.reduce((s, g) => s + g.icons.length, 0)} icons`)
