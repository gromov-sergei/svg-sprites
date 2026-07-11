import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { build as viteBuild } from 'vite'
import webpack from 'webpack'

const TINY_SPRITE = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '<style>:root>svg{display:none}:root>svg:target{display:block}</style>',
  '<svg id="check" viewBox="0 0 16 16">',
  '<path d="M1 8l4 4L15 2"/>',
  '</svg>',
  '</svg>',
].join('')

function getOutputFiles(directory, extension) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...getOutputFiles(entryPath, extension).map((filePath) => path.join(entry.name, filePath)))
    } else if (entry.name.endsWith(extension)) {
      files.push(entry.name)
    }
  }

  return files
}

test('Vite target keeps a tiny sprite as a separate asset', async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-vite-target-'))
  const outputDir = path.join(rootDir, 'dist')

  fs.writeFileSync(
    path.join(rootDir, 'index.html'),
    '<div id="root"></div><script type="module" src="/main.js"></script>',
  )
  fs.writeFileSync(
    path.join(rootDir, 'main.js'),
    [
      "import spriteUrl from './sprite.svg?no-inline'",
      "document.querySelector('#root').dataset.spriteUrl = spriteUrl",
      '',
    ].join('\n'),
  )
  fs.writeFileSync(path.join(rootDir, 'sprite.svg'), TINY_SPRITE)

  await viteBuild({
    root: rootDir,
    logLevel: 'silent',
    build: {
      outDir: outputDir,
    },
  })

  const svgFiles = getOutputFiles(outputDir, '.svg')
  const jsFiles = getOutputFiles(outputDir, '.js')
  const javascript = jsFiles
    .map((filePath) => fs.readFileSync(path.join(outputDir, filePath), 'utf-8'))
    .join('\n')

  assert.equal(svgFiles.length, 1)
  assert.match(svgFiles[0], /sprite-[A-Za-z0-9_-]+\.svg$/)
  assert.doesNotMatch(javascript, /data:image\/svg\+xml/)
})

test('Webpack target emits new URL sprite through Asset Modules', async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-webpack-target-'))
  const outputDir = path.join(rootDir, 'dist')

  fs.writeFileSync(
    path.join(rootDir, 'index.js'),
    [
      "const spriteUrl = new URL('./sprite.svg', import.meta.url).href",
      'globalThis.__SPRITE_URL__ = spriteUrl',
      '',
    ].join('\n'),
  )
  fs.writeFileSync(path.join(rootDir, 'sprite.svg'), TINY_SPRITE)

  await new Promise((resolve, reject) => {
    webpack({
      context: rootDir,
      entry: './index.js',
      mode: 'production',
      output: {
        assetModuleFilename: 'assets/[name]-[contenthash][ext]',
        filename: 'bundle.js',
        path: outputDir,
      },
    }, (error, stats) => {
      if (error) {
        reject(error)
        return
      }

      if (!stats || stats.hasErrors()) {
        const errors = stats?.toJson({ all: false, errors: true }).errors ?? []
        reject(new Error(errors.map((item) => item.message).join('\n')))
        return
      }

      resolve()
    })
  })

  const svgFiles = getOutputFiles(outputDir, '.svg')
  const javascript = fs.readFileSync(path.join(outputDir, 'bundle.js'), 'utf-8')

  assert.equal(svgFiles.length, 1)
  assert.match(svgFiles[0], /sprite-[a-f0-9]+\.svg$/)
  assert.doesNotMatch(javascript, /data:image\/svg\+xml/)
})
