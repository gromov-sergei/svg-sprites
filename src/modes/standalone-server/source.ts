import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { SpriteSourceContent } from '../../compiler.js'
import { validateIconIds } from '../../core/prepare-sprite.js'
import type { PreparedContentSprite } from '../../core/mode-adapter.js'
import { resolveSpriteSources } from '../../scanner.js'
import type { ResolvedSpriteConfig, ServerSvgInput } from '../../types.js'

const MAX_SOURCE_BYTES = 2 * 1024 * 1024
const MAX_TOTAL_BYTES = 25 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 15_000

function sha256(content: string | Uint8Array): string {
  return createHash('sha256').update(content).digest('hex')
}

function assertSvg(content: string, name: string): void {
  if (!/<svg\b/i.test(content)) throw new Error(`HTTP input "${name}" is not an SVG document.`)
  if (/<!DOCTYPE|<script\b|<foreignObject\b|\son[a-z]+\s*=/i.test(content)) {
    throw new Error(`HTTP input "${name}" contains unsupported active SVG content.`)
  }
}

async function loadHttpInput(input: ServerSvgInput): Promise<SpriteSourceContent> {
  let url: URL
  try {
    url = new URL(input.url)
  } catch {
    throw new Error(`Invalid HTTP input URL for icon "${input.name}".`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`HTTP input "${input.name}" must use http: or https:.`)
  }
  if (url.username || url.password) {
    throw new Error(`HTTP input "${input.name}" must not contain URL credentials.`)
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  if (!response.ok) {
    throw new Error(`Cannot load HTTP input "${input.name}": ${response.status} ${response.statusText}`)
  }
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_SOURCE_BYTES) {
    throw new Error(`HTTP input "${input.name}" exceeds the ${MAX_SOURCE_BYTES} byte limit.`)
  }
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > MAX_SOURCE_BYTES) {
    throw new Error(`HTTP input "${input.name}" exceeds the ${MAX_SOURCE_BYTES} byte limit.`)
  }
  const content = new TextDecoder().decode(bytes)
  assertSvg(content, input.name)
  if (input.sha256 && sha256(bytes) !== input.sha256.toLowerCase()) {
    throw new Error(`HTTP input "${input.name}" SHA-256 does not match the configured value.`)
  }
  return { name: input.name, content }
}

function loadLocalInputs(config: ResolvedSpriteConfig, input: string[]): SpriteSourceContent[] {
  if (input.length === 0) return []
  const folder = resolveSpriteSources({ name: config.name, format: 'stack', input })
  return folder.files.map((filePath) => ({
    name: path.basename(filePath, '.svg'),
    content: fs.readFileSync(filePath, 'utf8'),
  }))
}

export async function prepareStandaloneServerSprite(
  config: ResolvedSpriteConfig,
): Promise<PreparedContentSprite> {
  const localInput = config.input.filter((entry): entry is string => typeof entry === 'string')
  const httpInput = config.input.filter((entry): entry is ServerSvgInput => typeof entry !== 'string')
  const sources = [
    ...loadLocalInputs(config, localInput),
    ...await Promise.all(httpInput.map(loadHttpInput)),
  ].sort((left, right) => left.name.localeCompare(right.name))

  if (sources.length === 0) throw new Error('standalone@server requires at least one SVG input.')
  const totalBytes = sources.reduce((total, source) => total + Buffer.byteLength(source.content), 0)
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error(`standalone@server inputs exceed the ${MAX_TOTAL_BYTES} total byte limit.`)
  }
  const iconNames = sources.map((source) => source.name)
  if (new Set(iconNames).size !== iconNames.length) {
    throw new Error('standalone@server inputs contain duplicate icon names.')
  }
  validateIconIds(iconNames)

  return { kind: 'content', name: config.name, sources, iconNames }
}
