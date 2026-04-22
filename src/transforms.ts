/**
 * SVG-трансформации для обработки иконок перед сборкой спрайта.
 *
 * - Удаление width/height с корневого <svg>
 * - Замена цветов на CSS-переменные (моно/мульти)
 * - Добавление transition к элементам с цветом
 */



/** Элементы, которые могут содержать цвет (fill/stroke). */
const COLORABLE_TAGS = [
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'use',
]

/** Цвета, которые не считаются «реальными» и не заменяются. */
const IGNORED_COLORS = new Set(['none', 'transparent', 'inherit', 'unset', 'initial'])

/** Нормализует значение цвета для сравнения. */
function normalizeColor(value: string): string {
  return value.trim().toLowerCase()
}

/** Проверяет, является ли значение реальным цветом (не none/transparent/etc). */
function isRealColor(value: string): boolean {
  const normalized = normalizeColor(value)
  return normalized !== '' && !IGNORED_COLORS.has(normalized)
}

/**
 * Извлекает все уникальные цвета из SVG-строки.
 *
 * Ищет значения fill="..." и stroke="..." на дочерних элементах,
 * а также currentColor. Игнорирует none, transparent и т.п.
 */
function extractColors(svg: string): string[] {
  const colors = new Set<string>()

  // fill="..." и stroke="..." на элементах (не на корневом <svg>)
  const attrRegex = /(?:fill|stroke)="([^"]+)"/g
  let match: RegExpExecArray | null

  while ((match = attrRegex.exec(svg)) !== null) {
    const value = match[1]
    if (isRealColor(value)) {
      colors.add(normalizeColor(value))
    }
  }

  // fill:... и stroke:... в атрибуте style="..."
  const styleAttrRegex = /style="([^"]*)"/g
  while ((match = styleAttrRegex.exec(svg)) !== null) {
    const styleContent = match[1]
    const stylePropRegex = /(?:fill|stroke)\s*:\s*([^;"\s]+)/g
    let propMatch: RegExpExecArray | null
    while ((propMatch = stylePropRegex.exec(styleContent)) !== null) {
      const value = propMatch[1]
      if (isRealColor(value)) {
        colors.add(normalizeColor(value))
      }
    }
  }

  return [...colors]
}

/**
 * Удаляет атрибуты width и height с корневого элемента <svg>.
 */
function removeWidthHeight(svg: string): string {
  return svg.replace(
    /(<svg\b[^>]*?)\s+(?:width|height)="[^"]*"/g,
    '$1',
  )
}

/**
 * Формирует CSS-переменную для цвета.
 *
 * Моно (1 цвет): var(--icon-color-1, currentColor)
 * Мульти (N цветов): var(--icon-color-N, #original)
 */
function makeColorVar(index: number, originalColor: string, isMono: boolean): string {
  const fallback = isMono ? 'currentColor' : originalColor
  return `var(--icon-color-${index}, ${fallback})`
}

/**
 * Заменяет цвета в fill/stroke атрибутах на CSS-переменные.
 */
function replaceColors(svg: string, colorMap: Map<string, string>): string {
  // Замена в атрибутах fill="..." и stroke="..."
  let result = svg.replace(
    /((?:fill|stroke))="([^"]+)"/g,
    (full, attr: string, value: string) => {
      const normalized = normalizeColor(value)
      const replacement = colorMap.get(normalized)
      if (replacement) {
        return `${attr}="${replacement}"`
      }
      return full
    },
  )

  // Замена в style="...fill:...;stroke:..."
  result = result.replace(
    /style="([^"]*)"/g,
    (full, styleContent: string) => {
      const replaced = styleContent.replace(
        /((?:fill|stroke))\s*:\s*([^;"]+)/g,
        (styleFull, prop: string, value: string) => {
          const normalized = normalizeColor(value)
          const replacement = colorMap.get(normalized)
          if (replacement) {
            return `${prop}:${replacement}`
          }
          return styleFull
        },
      )
      return `style="${replaced}"`
    },
  )

  return result
}

/**
 * Добавляет inline transition к элементам, которые содержат fill или stroke с цветом.
 *
 * Добавляет style="transition:fill 0.3s,stroke 0.3s;" к элементам из COLORABLE_TAGS,
 * которые имеют fill или stroke с реальным цветом (или CSS-переменной).
 */
function addTransitions(svg: string): string {
  const tagPattern = new RegExp(
    `(<(?:${COLORABLE_TAGS.join('|')})\\b)([^>]*?)(/?>)`,
    'g',
  )

  return svg.replace(tagPattern, (full, open: string, attrs: string, close: string) => {
    // Проверяем, есть ли fill или stroke с реальным цветом (или var(...))
    const hasColor = /(?:fill|stroke)="(?!none|transparent)[^"]*"/.test(attrs)
      || /style="[^"]*(?:fill|stroke)\s*:[^"]*"/.test(attrs)

    if (!hasColor) {
      return full
    }

    // Если уже есть style="...", добавляем transition в него
    if (/style="/.test(attrs)) {
      const newAttrs = attrs.replace(
        /style="([^"]*)"/,
        (_, existing: string) => {
          // Не добавляем дубль, если transition уже есть
          if (existing.includes('transition')) return `style="${existing}"`
          const sep = existing.endsWith(';') || existing === '' ? '' : ';'
          return `style="${existing}${sep}transition:fill 0.3s,stroke 0.3s;"`
        },
      )
      return `${open}${newAttrs}${close}`
    }

    // Иначе добавляем новый атрибут style
    return `${open}${attrs} style="transition:fill 0.3s,stroke 0.3s;"${close}`
  })
}

import type { TransformOptions } from './types.js'

/**
 * Shape transform для svg-sprite.
 *
 * Применяет трансформации в зависимости от опций:
 * - removeSize: удаление width/height (по умолчанию: true)
 * - replaceColors: замена цветов на CSS-переменные (по умолчанию: true)
 * - addTransition: добавление transition к элементам с цветом (по умолчанию: true)
 */
export function createShapeTransform(options: TransformOptions = {}): (
  shape: { getSVG: (inline: boolean) => string; setSVG: (svg: string) => void },
  spriter: unknown,
  callback: (error: Error | null) => void,
) => void {
  const {
    removeSize = true,
    replaceColors: doReplaceColors = true,
    addTransition = true,
  } = options

  return (shape, _spriter, callback) => {
    try {
      let svg = shape.getSVG(false)

      // 1. Удаляем width/height
      if (removeSize) {
        svg = removeWidthHeight(svg)
      }

      // 2. Извлекаем уникальные цвета и заменяем на CSS-переменные
      if (doReplaceColors) {
        const colors = extractColors(svg)

        if (colors.length > 0) {
          const isMono = colors.length === 1
          const colorMap = new Map<string, string>()

          colors.forEach((color, i) => {
            colorMap.set(color, makeColorVar(i + 1, color, isMono))
          })

          svg = replaceColors(svg, colorMap)
        }
      }

      // 3. Добавляем transition к элементам с цветом
      if (addTransition) {
        svg = addTransitions(svg)
      }

      shape.setSVG(svg)
      callback(null)
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
