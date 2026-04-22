const ESCAPE_RE = /[&<>"]/g
const ESCAPE_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

const escape = (str: string): string => str.replace(ESCAPE_RE, (c) => ESCAPE_MAP[c])

type Token = { kind: string; match: string }
type Rule = [RegExp, string]

const HTML_RULES: Rule[] = [
  [/<!--[\s\S]*?-->/g, 'comment'],
  [/<\/?[\w-]+/g, 'tag'],
  [/<\/?/g, 'punctuation'],
  [/\/?>/g, 'punctuation'],
  [/[\w-]+(?=\s*=)/g, 'attr'],
  [/=/g, 'punctuation'],
  [/"[^"]*"|'[^']*'/g, 'string'],
]

const CSS_RULES: Rule[] = [
  [/\/\*[\s\S]*?\*\//g, 'comment'],
  [/\.[\w-]+/g, 'selector'],
  [/[\w-]+(?=\s*:)/g, 'property'],
  [/[:;]/g, 'punctuation'],
  [/\{|\}/g, 'punctuation'],
  [/'[^']*'|"[^"]*"/g, 'string'],
  [/#[\da-fA-F]{3,8}\b/g, 'color'],
  [/\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg|s|ms)?/g, 'number'],
  [/url\([^)]*\)/g, 'function'],
]

const RULES: Record<string, Rule[]> = { html: HTML_RULES, css: CSS_RULES, xml: HTML_RULES }

const tokenize = (code: string, lang: string): Token[] => {
  const rules = RULES[lang] ?? []
  const tokens: Token[] = []
  let pos = 0

  while (pos < code.length) {
    let matched = false
    for (const [re, kind] of rules) {
      re.lastIndex = pos
      const m = re.exec(code)
      if (m && m.index === pos) {
        tokens.push({ kind, match: m[0] })
        pos += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      const last = tokens[tokens.length - 1]
      const ch = code[pos]
      if (last && last.kind === 'plain') {
        last.match += ch
      } else {
        tokens.push({ kind: 'plain', match: ch })
      }
      pos++
    }
  }

  return tokens
}

export const highlight = (code: string, lang: string): string =>
  tokenize(code, lang)
    .map((t) => (t.kind === 'plain' ? escape(t.match) : `<span class="hl-${t.kind}">${escape(t.match)}</span>`))
    .join('')
