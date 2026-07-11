/** Преобразует kebab-case имя в PascalCase. */
export function toPascalCase(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/** Преобразует имя папки в допустимое kebab-case имя спрайта. */
export function toKebabCase(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export function validateSpriteName(name: string): void {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `React config: "name" must be kebab-case and start with a letter. Received: "${name}".`,
    )
  }
}
