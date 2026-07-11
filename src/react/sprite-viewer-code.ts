import type { SpriteManifest, SpriteManifestIcon } from './types.js'

export type SpriteViewerTab = 'react' | 'svg' | 'img' | 'css'
export type SpriteViewerCodeLanguage = 'tsx' | 'html' | 'css'

export const SPRITE_VIEWER_TABS: ReadonlyArray<{ id: SpriteViewerTab; label: string }> = [
  { id: 'react', label: 'React' },
  { id: 'svg', label: 'SVG' },
  { id: 'img', label: 'IMG' },
  { id: 'css', label: 'CSS' },
]

export function tabsForFormat(format: SpriteManifest['format']) {
  return format === 'stack'
    ? SPRITE_VIEWER_TABS
    : SPRITE_VIEWER_TABS.filter((tab) => tab.id === 'react' || tab.id === 'svg')
}

export function viewBoxSize(viewBox: string | null): string | null {
  if (!viewBox) return null
  const values = viewBox.trim().split(/[\s,]+/).map(Number)
  return values.length === 4 && values.every(Number.isFinite)
    ? `${values[2]} × ${values[3]}`
    : null
}

export function normalizeHexColor(value: string, currentColor = '#1a1a1a'): string {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'currentcolor') return normalizeHexColor(currentColor)

  const shortHex = normalized.match(/^#([\da-f])([\da-f])([\da-f])(?:[\da-f])?$/i)
  if (shortHex) return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`

  const longHex = normalized.match(/^#([\da-f]{6})(?:[\da-f]{2})?$/i)
  if (longHex) return `#${longHex[1]}`

  const rgb = normalized.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/)
  if (rgb) {
    return `#${rgb.slice(1, 4).map((part) => Math.min(255, Number(part)).toString(16).padStart(2, '0')).join('')}`
  }

  const named: Record<string, string> = {
    black: '#000000',
    blue: '#0000ff',
    cyan: '#00ffff',
    gray: '#808080',
    green: '#008000',
    grey: '#808080',
    magenta: '#ff00ff',
    orange: '#ffa500',
    pink: '#ffc0cb',
    purple: '#800080',
    red: '#ff0000',
    white: '#ffffff',
    yellow: '#ffff00',
  }
  return named[normalized] ?? normalizeHexColor(currentColor === value ? '#1a1a1a' : currentColor)
}

function styleLines(overrides: Readonly<Record<string, string>>): string[] {
  return Object.entries(overrides).map(([variable, color]) => `    ${JSON.stringify(variable)}: ${JSON.stringify(color)},`)
}

function htmlAttribute(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
  }
  return value.replace(/[&"<>]/g, (character) => entities[character])
}

function cssUrl(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export function generateViewerCode(options: {
  manifest: SpriteManifest
  icon: SpriteManifestIcon
  tab: SpriteViewerTab
  colorOverrides: Readonly<Record<string, string>>
  cssColor: string
}): { code: string; language: SpriteViewerCodeLanguage } {
  const { manifest, icon, tab, colorOverrides, cssColor } = options
  const href = `${manifest.spriteUrl}#${icon.id}`
  const overrides = styleLines(colorOverrides)

  if (tab === 'react') {
    if (overrides.length === 0) {
      return {
        code: `<${manifest.componentName} icon=${JSON.stringify(icon.name)} />`,
        language: 'tsx',
      }
    }
    return {
      code: [
        `<${manifest.componentName}`,
        `  icon=${JSON.stringify(icon.name)}`,
        '  style={{',
        ...overrides,
        '  }}',
        '/>',
      ].join('\n'),
      language: 'tsx',
    }
  }

  if (tab === 'svg') {
    const style = Object.entries(colorOverrides)
      .map(([variable, color]) => `${variable}: ${color}`)
      .join('; ')
    return {
      code: `<svg width="24" height="24"${style ? ` style="${htmlAttribute(style)}"` : ''}>\n  <use href="${htmlAttribute(href)}" />\n</svg>`,
      language: 'html',
    }
  }

  if (tab === 'img') {
    return {
      code: `<img src="${htmlAttribute(href)}" width="24" height="24" alt="${htmlAttribute(icon.name)}">`,
      language: 'html',
    }
  }

  const className = `icon-${icon.name.replace(/[^a-zA-Z0-9_-]+/g, '-') || 'sprite'}`
  const escapedHref = cssUrl(href)
  return {
    code: [
      `.${className} {`,
      '  width: 24px;',
      '  height: 24px;',
      `  mask: url('${escapedHref}') no-repeat center / contain;`,
      `  -webkit-mask: url('${escapedHref}') no-repeat center / contain;`,
      `  background-color: ${cssColor};`,
      '}',
    ].join('\n'),
    language: 'css',
  }
}

const ESCAPE_RE = /[&<>"]/g
const ESCAPE_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
type HighlightRule = [RegExp, string]

const MARKUP_RULES: HighlightRule[] = [
  [/<!--[\s\S]*?-->/g, 'comment'],
  [/<\/?[\w.-]+/g, 'tag'],
  [/[\w-]+(?=\s*=)/g, 'attr'],
  [/"[^"]*"|'[^']*'/g, 'string'],
]

const CSS_RULES: HighlightRule[] = [
  [/\/\*[\s\S]*?\*\//g, 'comment'],
  [/\.[\w-]+/g, 'selector'],
  [/[\w-]+(?=\s*:)/g, 'property'],
  [/'[^']*'|"[^"]*"/g, 'string'],
  [/#[\da-fA-F]{3,8}\b/g, 'color'],
  [/\d+(?:\.\d+)?(?:px|em|rem|%)?/g, 'number'],
]

export function highlightViewerCode(code: string, language: SpriteViewerCodeLanguage): string {
  const rules = language === 'css' ? CSS_RULES : MARKUP_RULES
  const tokens: Array<{ kind: string; value: string }> = []
  let position = 0

  while (position < code.length) {
    let match: RegExpExecArray | null = null
    let kind = ''

    for (const [rule, ruleKind] of rules) {
      rule.lastIndex = position
      const candidate = rule.exec(code)
      if (candidate?.index === position) {
        match = candidate
        kind = ruleKind
        break
      }
    }

    if (match) {
      tokens.push({ kind, value: match[0] })
      position += match[0].length
    } else {
      const previous = tokens.at(-1)
      if (previous?.kind === '') previous.value += code[position]
      else tokens.push({ kind: '', value: code[position] })
      position++
    }
  }

  return tokens.map(({ kind, value }) => {
    const escaped = value.replace(ESCAPE_RE, (character) => ESCAPE_MAP[character])
    return kind ? `<span class="hl-${kind}">${escaped}</span>` : escaped
  }).join('')
}
