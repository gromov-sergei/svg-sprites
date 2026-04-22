/**
 * Конвертирует CSS-цвет (rgb или hex) в hex-формат.
 */
export const rgbToHex = (color: string): string => {
  if (color.startsWith('#')) {
    return color
  }

  const match = color.match(/\d+/g)

  if (match && match.length >= 3) {
    return '#' + match.slice(0, 3).map((c) => parseInt(c).toString(16).padStart(2, '0')).join('')
  }

  return '#000000'
}
