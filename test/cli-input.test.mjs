import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

test('CLI accepts repeated --input paths and glob patterns', () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-cli-input-'))
  const iconsDir = path.join(rootDir, 'icons')
  fs.mkdirSync(iconsDir)
  fs.writeFileSync(path.join(iconsDir, 'check.svg'), '<svg viewBox="0 0 16 16"><path /></svg>')
  fs.writeFileSync(path.join(iconsDir, 'close.svg'), '<svg viewBox="0 0 16 16"><path /></svg>')

  const result = spawnSync(process.execPath, [
    'dist/cli.js',
    '--mode=standalone',
    '--name=cli-icons',
    '--input',
    'icons/*.svg',
    '--input',
    '!icons/close.svg',
    rootDir,
  ], {
    cwd: path.resolve('.'),
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr)
  const sprite = fs.readFileSync(path.join(rootDir, '.svg-sprite', 'sprite.svg'), 'utf8')
  assert.match(sprite, /id="check"/)
  assert.doesNotMatch(sprite, /id="close"/)
})

test('CLI rejects removed input flags', () => {
  const result = spawnSync(process.execPath, [
    'dist/cli.js',
    '--input-folder=icons',
    '.',
  ], {
    cwd: path.resolve('.'),
    encoding: 'utf8',
  })

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Unknown argument: --input-folder=icons/)
})
