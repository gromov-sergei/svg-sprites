import type {
  SpriteViewerManifest,
  SpriteViewerManifestIcon,
  SpriteViewerManifestLoader,
  SpriteViewerRemoteSource,
  SpriteViewerSource,
  SpriteViewerSources,
} from './types.js'

const manifestLoaderCache = new WeakMap<SpriteViewerManifestLoader, Promise<SpriteViewerManifest>>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isManifestIcon(value: unknown): value is SpriteViewerManifestIcon {
  if (!isRecord(value)) return false
  return typeof value.name === 'string'
    && typeof value.id === 'string'
    && (value.viewBox === null || typeof value.viewBox === 'string')
    && Array.isArray(value.colors)
}

export function isSpriteViewerManifest(value: unknown): value is SpriteViewerManifest {
  if (!isRecord(value)) return false
  return value.schemaVersion === 1
    && value.generator === '@gromlab/svg-sprites'
    && typeof value.name === 'string'
    && typeof value.target === 'string'
    && (value.format === 'stack' || value.format === 'symbol')
    && typeof value.iconCount === 'number'
    && typeof value.spriteUrl === 'string'
    && Array.isArray(value.icons)
    && value.icons.every(isManifestIcon)
}

function isManifestData(value: unknown): value is Omit<SpriteViewerManifest, 'spriteUrl'> {
  return isRecord(value)
    && value.schemaVersion === 1
    && value.generator === '@gromlab/svg-sprites'
    && typeof value.name === 'string'
    && typeof value.target === 'string'
    && (value.format === 'stack' || value.format === 'symbol')
    && typeof value.iconCount === 'number'
    && Array.isArray(value.icons)
    && value.icons.every(isManifestIcon)
}

function manifestCandidate(value: unknown): unknown {
  if (!isRecord(value)) return value
  if (isSpriteViewerManifest(value) || isManifestData(value)) return value
  return value.default ?? value.spriteManifest ?? value
}

export function normalizeSpriteViewerManifest(value: unknown, spriteUrl?: string): SpriteViewerManifest {
  const candidate = manifestCandidate(value)
  if (isSpriteViewerManifest(candidate)) return candidate
  if (spriteUrl && isManifestData(candidate)) return { ...candidate, spriteUrl }
  throw new Error('The loaded source does not contain a valid SVG sprite manifest.')
}

export function sourceArray(sources: SpriteViewerSources): readonly SpriteViewerSource[] {
  return Array.isArray(sources)
    ? sources
    : Object.values(sources as Readonly<Record<string, SpriteViewerSource>>)
}

export function isRemoteSource(source: SpriteViewerSource): source is SpriteViewerRemoteSource {
  if (!isRecord(source)) return false
  const candidate = source as Record<string, unknown>
  return typeof candidate.manifestUrl === 'string'
    && typeof candidate.spriteUrl === 'string'
}

export function directManifests(sources: SpriteViewerSources): SpriteViewerManifest[] {
  return sourceArray(sources)
    .filter((source) => typeof source !== 'function' && !isRemoteSource(source))
    .map((source) => normalizeSpriteViewerManifest(source))
    .sort(compareManifests)
}

export function compareManifests(left: SpriteViewerManifest, right: SpriteViewerManifest): number {
  return left.name < right.name ? -1 : left.name > right.name ? 1 : 0
}

async function loadRemoteSource(source: SpriteViewerRemoteSource): Promise<SpriteViewerManifest> {
  const response = await fetch(source.manifestUrl)
  if (!response.ok) {
    throw new Error(`Cannot load SVG sprite manifest: ${response.status} ${response.statusText}`)
  }
  return normalizeSpriteViewerManifest(await response.json(), source.spriteUrl)
}

export async function resolveViewerSource(source: SpriteViewerSource): Promise<SpriteViewerManifest> {
  if (isRemoteSource(source)) return loadRemoteSource(source)
  if (typeof source !== 'function') return normalizeSpriteViewerManifest(source)

  const cached = manifestLoaderCache.get(source)
  if (cached) return cached

  const pending = Promise.resolve().then(source).then((value) => normalizeSpriteViewerManifest(value))
  manifestLoaderCache.set(source, pending)
  void pending.catch(() => {
    if (manifestLoaderCache.get(source) === pending) manifestLoaderCache.delete(source)
  })
  return pending
}
