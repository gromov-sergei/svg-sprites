import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { generate } from '../dist/index.js'

test('generates a React directory entry-point', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-react-entry-'))
  const inputDir = path.join(root, 'icons')
  const outputDir = path.join(root, 'public', 'sprites')
  const reactDir = path.join(root, 'src', 'shared', 'ui', 'svg-sprite')

  fs.mkdirSync(inputDir, { recursive: true })
  fs.writeFileSync(
    path.join(inputDir, 'check.svg'),
    '<svg viewBox="0 0 16 16"><path d="M1 8l4 4L15 2" /></svg>',
  )

  await generate({
    output: outputDir,
    publicPath: '/sprites',
    preview: false,
    react: reactDir,
    sprites: [
      {
        name: 'icons',
        input: inputDir,
      },
    ],
  })

  const indexPath = path.join(reactDir, 'index.ts')
  const index = fs.readFileSync(indexPath, 'utf-8')

  assert.ok(fs.existsSync(indexPath))
  assert.match(index, /export \{ SvgSprite \} from '\.\/svg-sprite'/)
  assert.match(index, /SvgSpriteProps/)
})
