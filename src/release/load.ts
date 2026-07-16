import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createCompiledSpriteArtifact, type CompiledIcon, type CompiledSpriteArtifact } from '../core/compiled-artifact.js'
import type { PreparedRemoteSprite } from '../core/mode-adapter.js'
import type { SpriteCompileProfile, ServerSpriteAsset, ServerSpriteManifest } from './types.js'

const MAX_MANIFEST_BYTES = 1024 * 1024
const MAX_SPRITE_BYTES = 25 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 15_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function assertHash(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) {
    throw new Error(`Remote sprite manifest: "${field}" must be a lowercase SHA-256 hash.`)
  }
}

function validateIcon(value: unknown, index: number): asserts value is CompiledIcon {
  if (!isRecord(value)) throw new Error(`Remote sprite manifest: icons[${index}] must be an object.`)
  if (typeof value.name !== 'string' || value.name === '') {
    throw new Error(`Remote sprite manifest: icons[${index}].name must be a non-empty string.`)
  }
  if (typeof value.id !== 'string' || value.id === '') {
    throw new Error(`Remote sprite manifest: icons[${index}].id must be a non-empty string.`)
  }
  if (value.viewBox !== null && typeof value.viewBox !== 'string') {
    throw new Error(`Remote sprite manifest: icons[${index}].viewBox must be a string or null.`)
  }
  if (!Array.isArray(value.colors) || value.colors.some((color) => (
    !isRecord(color)
    || typeof color.variable !== 'string'
    || typeof color.fallback !== 'string'
  ))) {
    throw new Error(`Remote sprite manifest: icons[${index}].colors must be valid color metadata.`)
  }
}

function validateAsset(value: unknown, profile: SpriteCompileProfile): asserts value is ServerSpriteAsset {
  if (!isRecord(value)) throw new Error(`Remote sprite manifest: missing "${profile}" sprite profile.`)
  if (typeof value.href !== 'string' || value.href === '') {
    throw new Error(`Remote sprite manifest: sprites.${profile}.href must be a non-empty string.`)
  }
  assertHash(value.sha256, `sprites.${profile}.sha256`)
  if (!Number.isSafeInteger(value.byteLength) || (value.byteLength as number) <= 0) {
    throw new Error(`Remote sprite manifest: sprites.${profile}.byteLength must be a positive integer.`)
  }
}

function validateTransform(value: unknown): asserts value is ServerSpriteManifest['transform'] {
  if (!isRecord(value)) throw new Error('Remote sprite manifest: "transform" must be an object.')
  for (const option of ['removeSize', 'replaceColors', 'addTransition']) {
    if (typeof value[option] !== 'boolean') {
      throw new Error(`Remote sprite manifest: transform.${option} must be a boolean.`)
    }
  }
}

export function validateServerSpriteManifest(value: unknown): asserts value is ServerSpriteManifest {
  if (!isRecord(value)) throw new Error('Remote sprite manifest must be an object.')
  if (value.kind !== '@gromlab/svg-sprites/server' || value.schemaVersion !== 1) {
    throw new Error('Remote sprite manifest has an unsupported kind or schemaVersion.')
  }
  if (value.generator !== '@gromlab/svg-sprites' || value.mode !== 'standalone@server' || value.target !== 'server') {
    throw new Error('Remote sprite manifest was not produced by standalone@server.')
  }
  if (typeof value.name !== 'string' || value.name === '') throw new Error('Remote sprite manifest: "name" is required.')
  if (value.description !== undefined && typeof value.description !== 'string') {
    throw new Error('Remote sprite manifest: "description" must be a string.')
  }
  if (value.format !== 'stack') throw new Error('Remote sprite manifest: unsupported sprite format.')
  if (typeof value.generatedNotice !== 'boolean') throw new Error('Remote sprite manifest: "generatedNotice" must be a boolean.')
  validateTransform(value.transform)
  if (!Array.isArray(value.icons)) throw new Error('Remote sprite manifest: "icons" must be an array.')
  value.icons.forEach(validateIcon)
  if (value.iconCount !== value.icons.length) throw new Error('Remote sprite manifest: iconCount does not match icons.')
  if (new Set(value.icons.map((icon) => icon.name)).size !== value.icons.length) {
    throw new Error('Remote sprite manifest contains duplicate icon names.')
  }
  if (new Set(value.icons.map((icon) => icon.id)).size !== value.icons.length) {
    throw new Error('Remote sprite manifest contains duplicate icon IDs.')
  }
  if (!isRecord(value.sprites)) throw new Error('Remote sprite manifest: "sprites" must be an object.')
  validateAsset(value.sprites.stack, 'stack')
  validateAsset(value.sprites['stack-root-viewbox'], 'stack-root-viewbox')
}

function isHttpLocation(location: string): boolean {
  return /^https?:\/\//i.test(location)
}

async function fetchBytes(url: string, maximumBytes: number, label: string): Promise<{ bytes: Uint8Array; location: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  if (!response.ok) throw new Error(`Cannot load ${label}: ${response.status} ${response.statusText}`)
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new Error(`${label} exceeds the ${maximumBytes} byte limit.`)
  }
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > maximumBytes) throw new Error(`${label} exceeds the ${maximumBytes} byte limit.`)
  return { bytes, location: response.url }
}

async function readResource(location: string, maximumBytes: number, label: string): Promise<{ bytes: Uint8Array; location: string }> {
  if (isHttpLocation(location)) return fetchBytes(location, maximumBytes, label)
  const bytes = fs.readFileSync(location)
  if (bytes.byteLength > maximumBytes) throw new Error(`${label} exceeds the ${maximumBytes} byte limit.`)
  return { bytes, location: path.resolve(location) }
}

function resolveAssetLocation(manifestLocation: string, href: string): string {
  if (isHttpLocation(href)) return href
  if (isHttpLocation(manifestLocation)) return new URL(href, manifestLocation).href
  return path.resolve(path.dirname(manifestLocation), href)
}

export async function prepareRemoteSprite(manifestLocation: string): Promise<PreparedRemoteSprite> {
  const resource = await readResource(manifestLocation, MAX_MANIFEST_BYTES, 'remote sprite manifest')
  let manifest: unknown
  try {
    manifest = JSON.parse(new TextDecoder().decode(resource.bytes))
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Cannot parse remote sprite manifest: ${reason}`)
  }
  validateServerSpriteManifest(manifest)
  return {
    kind: 'remote',
    manifest,
    manifestLocation: resource.location,
    iconNames: manifest.icons.map((icon) => icon.name),
  }
}

function sameIcons(actual: readonly CompiledIcon[], expected: readonly CompiledIcon[]): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

export async function loadRemoteSpriteArtifact(
  prepared: PreparedRemoteSprite,
  profile: SpriteCompileProfile,
): Promise<CompiledSpriteArtifact> {
  const asset = prepared.manifest.sprites[profile]
  const location = resolveAssetLocation(prepared.manifestLocation, asset.href)
  const resource = await readResource(location, MAX_SPRITE_BYTES, `remote sprite profile "${profile}"`)
  if (resource.bytes.byteLength !== asset.byteLength) {
    throw new Error(`Remote sprite profile "${profile}" byteLength does not match its manifest.`)
  }
  if (sha256(resource.bytes) !== asset.sha256) {
    throw new Error(`Remote sprite profile "${profile}" SHA-256 does not match its manifest.`)
  }
  const artifact = createCompiledSpriteArtifact(resource.bytes, prepared.iconNames, 'stack')
  if (!sameIcons(artifact.icons, prepared.manifest.icons)) {
    throw new Error(`Remote sprite profile "${profile}" icon metadata does not match its manifest.`)
  }
  return artifact
}
