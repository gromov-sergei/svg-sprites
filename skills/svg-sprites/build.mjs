import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import configs from './skill.config.mjs'

const skillDir = path.dirname(fileURLToPath(import.meta.url))
const artifactsDir = path.resolve(skillDir, '../artifacts')
const isCheck = process.argv.slice(2).includes('--check')

function assertSafeRelativePath(relativePath) {
  if (
    typeof relativePath !== 'string'
    || relativePath.length === 0
    || path.isAbsolute(relativePath)
    || relativePath.split(/[\\/]/).includes('..')
  ) {
    throw new Error(`Unsafe skill path: ${relativePath}`)
  }
}

function assertInside(parentDir, childPath) {
  const relativePath = path.relative(parentDir, childPath)
  if (relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))) return
  throw new Error(`Path is outside ${parentDir}: ${childPath}`)
}

function validateConfig(config, outputDir) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.name)) {
    throw new Error(`Invalid skill name: ${config.name}`)
  }
  if (typeof config.description !== 'string' || config.description.trim() === '') {
    throw new Error('Skill description must be a non-empty string')
  }
  if (!Array.isArray(config.references) || config.references.length === 0) {
    throw new Error('Skill references must be a non-empty array')
  }

  assertInside(artifactsDir, outputDir)
  assertSafeRelativePath(config.source)

  const targets = new Set()
  for (const reference of config.references) {
    assertSafeRelativePath(reference.to)
    if (targets.has(reference.to)) throw new Error(`Duplicate reference target: ${reference.to}`)
    targets.add(reference.to)
  }
}

function readRegularFile(filePath) {
  if (!existsSync(filePath)) throw new Error(`Source file not found: ${filePath}`)
  const stats = lstatSync(filePath)
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw new Error(`Source must be a regular file: ${filePath}`)
  }
  return readFileSync(filePath, 'utf8')
}

function renderSkill(config) {
  const sourcePath = path.resolve(skillDir, config.source)
  assertInside(skillDir, sourcePath)
  const body = readRegularFile(sourcePath).trim()
  if (body.startsWith('---')) throw new Error('Source SKILL.md must not contain frontmatter')

  return [
    '---',
    `name: ${config.name}`,
    `description: ${JSON.stringify(config.description)}`,
    '---',
    '',
    `<!-- Generated from skills/svg-sprites/${config.source}. Do not edit manually. -->`,
    '',
    body,
    '',
  ].join('\n')
}

function buildSkill(config, targetDir) {
  rmSync(targetDir, { recursive: true, force: true })
  mkdirSync(targetDir, { recursive: true })
  writeFileSync(path.join(targetDir, 'SKILL.md'), renderSkill(config))

  for (const reference of config.references) {
    const sourcePath = path.resolve(skillDir, reference.from)
    const targetPath = path.resolve(targetDir, reference.to)
    assertInside(targetDir, targetPath)
    readRegularFile(sourcePath)
    mkdirSync(path.dirname(targetPath), { recursive: true })
    copyFileSync(sourcePath, targetPath)
  }
}

function listFiles(directory, prefix = '') {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relativePath = path.posix.join(prefix, entry.name)
    const filePath = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Skill artifact must not contain symlinks: ${filePath}`)
    if (entry.isDirectory()) files.push(...listFiles(filePath, relativePath))
    else if (entry.isFile()) files.push(relativePath)
    else throw new Error(`Unsupported skill artifact entry: ${filePath}`)
  }
  return files
}

function validateMarkdown(skillRoot, relativePath) {
  const filePath = path.join(skillRoot, relativePath)
  const content = readFileSync(filePath, 'utf8')
  const fences = content.match(/^```/gm)?.length ?? 0
  if (fences % 2 !== 0) throw new Error(`Unbalanced code fences: ${relativePath}`)

  for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].trim().split(/\s+['"]/)[0]
    if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue
    const targetPath = decodeURIComponent(target.split('#')[0].split('?')[0])
    const resolvedPath = path.resolve(path.dirname(filePath), targetPath)
    assertInside(skillRoot, resolvedPath)
    if (!existsSync(resolvedPath)) {
      throw new Error(`Broken local link in ${relativePath}: ${target}`)
    }
  }
}

function validateArtifact(config, skillRoot) {
  const expectedFiles = [
    'SKILL.md',
    ...config.references.map((reference) => reference.to),
  ].sort()
  const actualFiles = listFiles(skillRoot).sort()

  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error(`Unexpected skill files:\n${actualFiles.join('\n')}`)
  }

  const skill = readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8')
  if (!skill.startsWith(`---\nname: ${config.name}\ndescription: `)) {
    throw new Error('Generated SKILL.md has invalid frontmatter')
  }
  if (/\bTODO\b/.test(skill)) throw new Error('Generated SKILL.md contains TODO')

  for (const relativePath of actualFiles.filter((filePath) => filePath.endsWith('.md'))) {
    validateMarkdown(skillRoot, relativePath)
  }
}

function compareArtifacts(expectedDir, actualDir) {
  if (!existsSync(actualDir)) throw new Error(`Skill artifact is missing: ${actualDir}`)

  const expectedFiles = listFiles(expectedDir)
  const actualFiles = listFiles(actualDir)
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error('Committed skill file list is out of date. Run npm run build:skill')
  }

  const changedFiles = expectedFiles.filter((relativePath) => {
    const expected = readFileSync(path.join(expectedDir, relativePath))
    const actual = readFileSync(path.join(actualDir, relativePath))
    return !expected.equals(actual)
  })
  if (changedFiles.length > 0) {
    throw new Error(`Committed skill is out of date:\n${changedFiles.join('\n')}`)
  }
}

if (!Array.isArray(configs) || configs.length === 0) {
  throw new Error('Skill configs must be a non-empty array')
}

const names = new Set()
const outputs = new Set()

for (const config of configs) {
  const outputDir = path.resolve(skillDir, config.output)
  validateConfig(config, outputDir)

  if (names.has(config.name)) throw new Error(`Duplicate skill name: ${config.name}`)
  if (outputs.has(outputDir)) throw new Error(`Duplicate skill output: ${config.output}`)
  names.add(config.name)
  outputs.add(outputDir)

  if (isCheck) {
    const temporaryRoot = mkdtempSync(path.join(tmpdir(), `${config.name}-skill-`))
    try {
      const expectedDir = path.join(temporaryRoot, config.name)
      buildSkill(config, expectedDir)
      validateArtifact(config, expectedDir)
      compareArtifacts(expectedDir, outputDir)
      console.log(`Skill is up to date: ${path.relative(process.cwd(), outputDir)}`)
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  } else {
    buildSkill(config, outputDir)
    validateArtifact(config, outputDir)
    console.log(`Built skill: ${path.relative(process.cwd(), outputDir)}`)
  }
}
