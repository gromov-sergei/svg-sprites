import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const rootDir = path.resolve(import.meta.dirname, '..')
const docsDir = path.join(rootDir, 'docs')
const guideModes = new Map([
  ['standalone.md', 'standalone'],
  ['standalone-vite.md', 'standalone@vite'],
  ['standalone-webpack.md', 'standalone@webpack'],
  ['react-vite.md', 'react@vite'],
  ['react-webpack.md', 'react@webpack'],
  ['next-app-turbopack.md', 'next@app/turbopack'],
  ['next-app-webpack.md', 'next@app/webpack'],
  ['next-pages-turbopack.md', 'next@pages/turbopack'],
  ['next-pages-webpack.md', 'next@pages/webpack'],
])

const sectionHeadings = {
  en: ['Generate the sprite', 'Debug and preview', 'Type the config'],
  ru: ['Генерация спрайта', 'Дебаг и превью', 'Типизация конфига'],
}

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory()
      ? markdownFiles(entryPath)
      : entry.name.endsWith('.md') ? [entryPath] : []
  })
}

test('exact-mode guides are reusable by docs and skills', () => {
  for (const language of ['en', 'ru']) {
    const guidesDir = path.join(docsDir, language, 'guides')
    const guideFiles = fs.readdirSync(guidesDir)
      .filter((file) => file !== 'README.md')
      .sort()
    assert.deepEqual(guideFiles, [...guideModes.keys()].sort())

    for (const [file, mode] of guideModes) {
      const source = fs.readFileSync(path.join(guidesDir, file), 'utf8')
      assert.equal(source.match(/^# /gm)?.length, 1, `${language}/${file} must have one H1`)
      const headings = source.match(/^## .+$/gm)?.map((heading) => (
        heading.replace(/^## (?:\d+\. )?/, '')
      ))
      assert.deepEqual(headings, sectionHeadings[language])
      assert.match(source, /npx --yes (?:--package=@gromlab\/svg-sprites@latest svg-sprites|@gromlab\/svg-sprites@latest)/)
      assert.match(source, /npm install --save-dev @gromlab\/svg-sprites/)
      assert.match(source, new RegExp(`mode: '${mode.replaceAll('/', '\\/')}'`))
      assert.doesNotMatch(source, /\]\([^)]+\)/, `${language}/${file} must not depend on its location`)

      const generation = source.indexOf(sectionHeadings[language][0])
      const preview = source.indexOf(sectionHeadings[language][1])
      const typing = source.indexOf(sectionHeadings[language][2])
      assert.ok(generation < preview && preview < typing)
    }
  }
})

test('all local documentation links resolve', () => {
  for (const file of markdownFiles(docsDir)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1]
      if (/^(?:https?:|mailto:|#)/.test(target)) continue
      const targetPath = decodeURIComponent(target.split('#')[0])
      assert.equal(
        fs.existsSync(path.resolve(path.dirname(file), targetPath)),
        true,
        `${path.relative(rootDir, file)} links to missing ${target}`,
      )
    }
  }
})
