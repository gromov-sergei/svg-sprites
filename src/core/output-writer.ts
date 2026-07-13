import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { SpriteMode } from '../targets/types.js'
import type { GeneratedFile } from './mode-adapter.js'
import {
  GENERATED_MARKER,
  GENERATED_NOTICE_MARKER,
  GENERATOR,
} from './generated-markers.js'

const STATE_PATH = '.svg-sprite/state.json'
const PREVIOUS_STATE_PATHS = [
  '.svg-sprite-data/state.json',
  'generated/state.json',
] as const
const LEGACY_STATE_PATH = 'generated/.svg-sprites.manifest.json'
const DATA_ROOT = '.svg-sprite'
const PREVIOUS_DATA_ROOT = '.svg-sprite-data'
const SYSTEM_FILES: readonly GeneratedFile[] = [
  {
    path: '.gitignore',
    content: `# ${GENERATED_MARKER}. Do not edit.\n/${DATA_ROOT}/\n`,
  },
]

type OutputState = {
  schemaVersion: 1
  generator: typeof GENERATOR
  owner: {
    mode: SpriteMode
    contractVersion: number
  }
  files: string[]
  warning?: string
}

type LegacyState = {
  version: 1
  generator: typeof GENERATOR
  files: string[]
}

function normalizeManagedPath(relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/')
  const parts = normalized.split('/')

  if (
    normalized === ''
    || path.posix.isAbsolute(normalized)
    || parts.some((part) => part === '' || part === '.' || part === '..')
    || normalized === STATE_PATH
    || PREVIOUS_STATE_PATHS.includes(normalized as typeof PREVIOUS_STATE_PATHS[number])
    || normalized === LEGACY_STATE_PATH
  ) {
    throw new Error(`Invalid generated file path: ${relativePath}`)
  }

  return normalized
}

function resolveManagedPath(rootDir: string, relativePath: string): string {
  const normalized = normalizeManagedPath(relativePath)
  const resolved = path.resolve(rootDir, normalized)
  const relative = path.relative(rootDir, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid generated file path: ${relativePath}`)
  }

  return resolved
}

function resolveInternalPath(rootDir: string, relativePath: string): string {
  const resolved = path.resolve(rootDir, relativePath)
  const relative = path.relative(rootDir, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid internal output path: ${relativePath}`)
  }
  return resolved
}

function assertNoSymlinks(rootDir: string, filePath: string): void {
  const relative = path.relative(rootDir, filePath)
  let currentPath = rootDir

  for (const segment of relative.split(path.sep)) {
    currentPath = path.join(currentPath, segment)
    try {
      if (fs.lstatSync(currentPath).isSymbolicLink()) {
        throw new Error(`Symbolic links are not allowed in generated paths: ${currentPath}`)
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') continue
      throw error
    }
  }
}

function parseJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    throw new Error(`Cannot parse generated state: ${filePath}`)
  }
}

function readOutputState(statePath: string): OutputState {
  const state = parseJsonFile(statePath)
  if (
    !state
    || typeof state !== 'object'
    || !('schemaVersion' in state)
    || state.schemaVersion !== 1
    || !('generator' in state)
    || state.generator !== GENERATOR
    || !('owner' in state)
    || !state.owner
    || typeof state.owner !== 'object'
    || !('mode' in state.owner)
    || typeof state.owner.mode !== 'string'
    || !('contractVersion' in state.owner)
    || typeof state.owner.contractVersion !== 'number'
    || !('files' in state)
    || !Array.isArray(state.files)
    || !state.files.every((file) => typeof file === 'string')
  ) {
    throw new Error(`Invalid generated state: ${statePath}`)
  }
  return state as OutputState
}

function readPreviousFiles(rootDir: string): {
  files: string[]
  obsoleteStatePath: string | null
} {
  for (const relativeStatePath of [STATE_PATH, ...PREVIOUS_STATE_PATHS]) {
    const statePath = resolveInternalPath(rootDir, relativeStatePath)
    assertNoSymlinks(rootDir, statePath)
    if (!fs.existsSync(statePath)) continue
    return {
      files: readOutputState(statePath).files.map(normalizeManagedPath),
      obsoleteStatePath: relativeStatePath === STATE_PATH ? null : statePath,
    }
  }

  const legacyStatePath = resolveInternalPath(rootDir, LEGACY_STATE_PATH)
  assertNoSymlinks(rootDir, legacyStatePath)
  if (!fs.existsSync(legacyStatePath)) return { files: [], obsoleteStatePath: null }

  const legacyState = parseJsonFile(legacyStatePath)
  if (
    !legacyState
    || typeof legacyState !== 'object'
    || !('version' in legacyState)
    || legacyState.version !== 1
    || !('generator' in legacyState)
    || legacyState.generator !== GENERATOR
    || !('files' in legacyState)
    || !Array.isArray(legacyState.files)
    || !legacyState.files.every((file) => typeof file === 'string')
  ) {
    throw new Error(`Invalid generated state: ${legacyStatePath}`)
  }

  return {
    files: (legacyState as LegacyState).files.map(normalizeManagedPath),
    obsoleteStatePath: legacyStatePath,
  }
}

function removeEmptyStateDirectory(rootDir: string, statePath: string): void {
  const directory = path.dirname(statePath)
  if (directory === rootDir) return
  try {
    fs.rmdirSync(directory)
  } catch (error) {
    if (error instanceof Error && 'code' in error && (
      error.code === 'ENOENT' || error.code === 'ENOTEMPTY'
    )) return
    throw error
  }
}

function removeEmptyManagedParents(rootDir: string, filePath: string): void {
  for (const relativeDataRoot of [DATA_ROOT, PREVIOUS_DATA_ROOT]) {
    const dataRoot = resolveInternalPath(rootDir, relativeDataRoot)
    let directory = path.dirname(filePath)
    const relative = path.relative(dataRoot, directory)
    if (relative.startsWith('..') || path.isAbsolute(relative)) continue

    while (directory !== dataRoot) {
      try {
        fs.rmdirSync(directory)
      } catch (error) {
        if (error instanceof Error && 'code' in error && (
          error.code === 'ENOENT' || error.code === 'ENOTEMPTY'
        )) return
        throw error
      }
      directory = path.dirname(directory)
    }
    return
  }
}

function hasGeneratedMarker(filePath: string): boolean {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false
  const content = fs.readFileSync(filePath, 'utf-8')
  return content.includes(GENERATED_MARKER) || content.includes(GENERATED_NOTICE_MARKER)
}

function writeFileAtomic(rootDir: string, filePath: string, content: string | Uint8Array): void {
  assertNoSymlinks(rootDir, filePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  assertNoSymlinks(rootDir, filePath)

  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`,
  )

  try {
    fs.writeFileSync(temporaryPath, content, { flag: 'wx' })
    fs.renameSync(temporaryPath, filePath)
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath)
  }
}

/** Применяет mode output plan и последним записывает ownership state. */
export function writeOutputPlan(
  rootDir: string,
  mode: SpriteMode,
  contractVersion: number,
  files: readonly GeneratedFile[],
  generatedNotice: boolean,
): void {
  const normalizedFiles = [...SYSTEM_FILES, ...files].map((file) => ({
    ...file,
    path: normalizeManagedPath(file.path),
  }))
  const nextFiles = normalizedFiles.map((file) => file.path)

  if (new Set(nextFiles).size !== nextFiles.length) {
    throw new Error(`Mode "${mode}" produced duplicate generated file paths.`)
  }

  const previous = readPreviousFiles(rootDir)
  const obsoleteFiles: string[] = []

  for (const file of normalizedFiles) {
    const filePath = resolveManagedPath(rootDir, file.path)
    assertNoSymlinks(rootDir, filePath)
    if (fs.existsSync(filePath) && !hasGeneratedMarker(filePath)) {
      throw new Error(
        `Refusing to overwrite a user file: ${filePath}\n`
        + 'Move the file or choose another sprite directory.',
      )
    }
  }

  for (const relativePath of previous.files) {
    if (nextFiles.includes(relativePath)) continue
    const filePath = resolveManagedPath(rootDir, relativePath)
    assertNoSymlinks(rootDir, filePath)

    if (fs.existsSync(filePath)) {
      if (!hasGeneratedMarker(filePath)) {
        throw new Error(`Refusing to delete a user file: ${filePath}`)
      }
      obsoleteFiles.push(filePath)
    }
  }

  for (const file of normalizedFiles) {
    writeFileAtomic(rootDir, resolveManagedPath(rootDir, file.path), file.content)
  }
  for (const filePath of obsoleteFiles) fs.unlinkSync(filePath)
  for (const filePath of obsoleteFiles) removeEmptyManagedParents(rootDir, filePath)
  if (previous.obsoleteStatePath && fs.existsSync(previous.obsoleteStatePath)) {
    fs.unlinkSync(previous.obsoleteStatePath)
    removeEmptyStateDirectory(rootDir, previous.obsoleteStatePath)
  }

  const state: OutputState = {
    schemaVersion: 1,
    generator: GENERATOR,
    owner: { mode, contractVersion },
    files: nextFiles,
    ...(generatedNotice && {
      warning: 'АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ. Не редактируйте вручную: изменения будут перезаписаны.',
    }),
  }
  const statePath = resolveInternalPath(rootDir, STATE_PATH)
  writeFileAtomic(rootDir, statePath, `${JSON.stringify(state, null, 2)}\n`)
}
