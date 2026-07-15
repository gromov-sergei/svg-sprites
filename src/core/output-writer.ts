import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { SpriteMode } from '../targets/types.js'
import {
  GENERATED_MARKER,
  GENERATED_NOTICE_MARKER,
} from './generated-markers.js'
import type { GeneratedFile } from './mode-adapter.js'

const DATA_ROOT = '.svg-sprite'
const DATA_PREFIX = `${DATA_ROOT}/`
const BACKUP_SUFFIX = '.old'
const STAGING_SUFFIX = '.tmp'
const GITIGNORE_CONTENT = `# ${GENERATED_MARKER}. Do not edit.\n/${DATA_ROOT}/\n`

function normalizeManagedPath(relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/')
  const parts = normalized.split('/')

  if (
    normalized === ''
    || path.posix.isAbsolute(normalized)
    || parts.some((part) => part === '' || part === '.' || part === '..')
  ) {
    throw new Error(`Invalid generated file path: ${relativePath}`)
  }

  return normalized
}

function resolveInsideRoot(rootDir: string, relativePath: string): string {
  const resolved = path.resolve(rootDir, relativePath)
  const relative = path.relative(rootDir, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid generated path: ${relativePath}`)
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

function hasGeneratedMarker(filePath: string): boolean {
  if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) return false
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

function validateGitignore(rootDir: string, createGitignore: boolean): void {
  if (!createGitignore) return
  const gitignorePath = resolveInsideRoot(rootDir, '.gitignore')
  assertNoSymlinks(rootDir, gitignorePath)

  if (fs.existsSync(gitignorePath) && !hasGeneratedMarker(gitignorePath)) {
    throw new Error(
      `Refusing to overwrite a user file: ${gitignorePath}\n`
      + 'Move the file or choose another sprite directory.',
    )
  }
}

function updateGitignore(rootDir: string, createGitignore: boolean): void {
  const gitignorePath = resolveInsideRoot(rootDir, '.gitignore')

  if (createGitignore) {
    writeFileAtomic(rootDir, gitignorePath, GITIGNORE_CONTENT)
  } else if (hasGeneratedMarker(gitignorePath)) {
    fs.unlinkSync(gitignorePath)
  }
}

function transientPaths(rootDir: string, suffix: string): string[] {
  return fs.readdirSync(rootDir)
    .filter((entry) => entry.startsWith(`${DATA_ROOT}.`) && entry.endsWith(suffix))
    .map((entry) => resolveInsideRoot(rootDir, entry))
}

function recoverInterruptedReplacement(rootDir: string): void {
  const outputPath = resolveInsideRoot(rootDir, DATA_ROOT)
  assertNoSymlinks(rootDir, outputPath)

  const backups = transientPaths(rootDir, BACKUP_SUFFIX)
    .sort((left, right) => fs.lstatSync(right).mtimeMs - fs.lstatSync(left).mtimeMs)

  if (!fs.existsSync(outputPath) && backups.length > 0) {
    const [latestBackup] = backups.splice(0, 1)
    assertNoSymlinks(rootDir, latestBackup)
    fs.renameSync(latestBackup, outputPath)
  }

  for (const transientPath of [
    ...backups,
    ...transientPaths(rootDir, STAGING_SUFFIX),
  ]) {
    assertNoSymlinks(rootDir, transientPath)
    fs.rmSync(transientPath, { recursive: true, force: true })
  }
}

function stageOutput(rootDir: string, files: readonly GeneratedFile[]): string {
  const stagingPath = resolveInsideRoot(
    rootDir,
    `${DATA_ROOT}.${process.pid}.${randomUUID()}${STAGING_SUFFIX}`,
  )
  assertNoSymlinks(rootDir, stagingPath)
  fs.mkdirSync(stagingPath)

  try {
    for (const file of files) {
      const relativePath = file.path.slice(DATA_PREFIX.length)
      const filePath = path.resolve(stagingPath, relativePath)
      const relative = path.relative(stagingPath, filePath)
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Invalid generated file path: ${file.path}`)
      }
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, file.content, { flag: 'wx' })
    }
    return stagingPath
  } catch (error) {
    fs.rmSync(stagingPath, { recursive: true, force: true })
    throw error
  }
}

function replaceOutput(rootDir: string, stagingPath: string): void {
  const outputPath = resolveInsideRoot(rootDir, DATA_ROOT)
  const backupPath = resolveInsideRoot(
    rootDir,
    `${DATA_ROOT}.${process.pid}.${randomUUID()}${BACKUP_SUFFIX}`,
  )
  assertNoSymlinks(rootDir, outputPath)

  if (fs.existsSync(outputPath) && !fs.lstatSync(outputPath).isDirectory()) {
    throw new Error(`Generated output path must be a directory: ${outputPath}`)
  }

  let movedPrevious = false
  try {
    if (fs.existsSync(outputPath)) {
      fs.renameSync(outputPath, backupPath)
      movedPrevious = true
    }
    fs.renameSync(stagingPath, outputPath)
  } catch (error) {
    if (movedPrevious && !fs.existsSync(outputPath) && fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, outputPath)
    }
    throw error
  }

  if (movedPrevious) fs.rmSync(backupPath, { recursive: true, force: true })
}

/** Полностью заменяет generated-каталог output plan. */
export function writeOutputPlan(
  rootDir: string,
  mode: SpriteMode,
  files: readonly GeneratedFile[],
  createGitignore = true,
): void {
  const normalizedFiles = files.map((file) => ({
    ...file,
    path: normalizeManagedPath(file.path),
  }))
  const paths = normalizedFiles.map((file) => file.path)

  if (paths.some((filePath) => !filePath.startsWith(DATA_PREFIX))) {
    throw new Error(`Mode "${mode}" produced a file outside ${DATA_ROOT}.`)
  }
  if (new Set(paths).size !== paths.length) {
    throw new Error(`Mode "${mode}" produced duplicate generated file paths.`)
  }

  recoverInterruptedReplacement(rootDir)
  validateGitignore(rootDir, createGitignore)
  const stagingPath = stageOutput(rootDir, normalizedFiles)

  try {
    replaceOutput(rootDir, stagingPath)
    updateGitignore(rootDir, createGitignore)
  } finally {
    if (fs.existsSync(stagingPath)) {
      fs.rmSync(stagingPath, { recursive: true, force: true })
    }
  }
}
