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
  ['standalone-server.md', 'standalone@server'],
  ['react-vite.md', 'react@vite'],
  ['react-webpack.md', 'react@webpack'],
  ['vue-vite.md', 'vue@vite'],
  ['vue-webpack.md', 'vue@webpack'],
  ['nuxt-vite.md', 'nuxt@vite'],
  ['nuxt-webpack.md', 'nuxt@webpack'],
  ['svelte-vite.md', 'svelte@vite'],
  ['svelte-webpack.md', 'svelte@webpack'],
  ['sveltekit-vite.md', 'sveltekit@vite'],
  ['angular-application.md', 'angular@application'],
  ['angular-webpack.md', 'angular@webpack'],
  ['astro-vite.md', 'astro@vite'],
  ['solid-vite.md', 'solid@vite'],
  ['solid-webpack.md', 'solid@webpack'],
  ['solid-start-vite.md', 'solid-start@vite'],
  ['preact-vite.md', 'preact@vite'],
  ['preact-webpack.md', 'preact@webpack'],
  ['qwik-vite.md', 'qwik@vite'],
  ['lit-vite.md', 'lit@vite'],
  ['lit-webpack.md', 'lit@webpack'],
  ['alpine-vite.md', 'alpine@vite'],
  ['alpine-webpack.md', 'alpine@webpack'],
  ['next-app-turbopack.md', 'next@app/turbopack'],
  ['next-app-webpack.md', 'next@app/webpack'],
  ['next-pages-turbopack.md', 'next@pages/turbopack'],
  ['next-pages-webpack.md', 'next@pages/webpack'],
])

const sectionHeadings = {
  en: {
    generation: 'Generate the sprite',
    usage: 'Use the sprite',
    preview: 'Debug and preview',
  },
  ru: {
    generation: 'Генерация спрайта',
    usage: 'Использование спрайта',
    preview: 'Дебаг и превью',
  },
}

const commandPatterns = {
  en: /npx --yes @gromlab\/svg-sprites(?:\s|$)/,
  ru: /npx --yes @gromlab\/svg-sprites(?:\s|$)/,
}

const spriteDirectoryPatterns = {
  en: /Choose a directory for the future SVG sprite/,
  ru: /Выберите каталог для будущего SVG-спрайта/,
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
      .filter((file) => file !== 'README.md' && file !== 'AGENTS.md')
      .sort()
    assert.deepEqual(guideFiles, [...guideModes.keys()].sort())

    for (const [file, mode] of guideModes) {
      const source = fs.readFileSync(path.join(guidesDir, file), 'utf8')
      assert.equal(source.match(/^# /gm)?.length, 1, `${language}/${file} must have one H1`)
      const headings = source.match(/^## .+$/gm)?.map((heading) => (
        heading.replace(/^## (?:\d+\. )?/, '')
      ))
      const expectedHeadings = mode === 'standalone'
        ? [sectionHeadings[language].generation, sectionHeadings[language].preview]
        : [
            sectionHeadings[language].generation,
            sectionHeadings[language].usage,
            sectionHeadings[language].preview,
          ]
      assert.deepEqual(headings, expectedHeadings)
      assert.match(source, commandPatterns[language])
      if (mode !== 'standalone@server') assert.match(source, spriteDirectoryPatterns[language])
      if (mode !== 'standalone' && mode !== 'standalone@server') {
        assert.match(source, /npm install --save-dev @gromlab\/svg-sprites/)
      }
      assert.doesNotMatch(source, /npx --yes[^\n]*@gromlab\/svg-sprites@/)
      assert.doesNotMatch(source, /check\.svg|icon="check"|#check|iconName: 'check'/)
      if (mode === 'standalone@server') {
        assert.match(source, /--mode standalone@server/)
        assert.match(source, /--input '\.\/icons\/\*\*\/\*\.svg' \\\n  \./)
        assert.doesNotMatch(source, /"mode": "standalone@server"/)
        assert.match(source, /aws s3 sync \.\/\.svg-sprite\/ s3:\/\/my-bucket\/app-icons\//)
        assert.match(source, /https:\/\/cdn\.example\.com\/app-icons\/svg-sprite\.manifest\.json/)
        assert.match(source, /"mode": "react@vite"/)
        assert.match(source, /"source": "remote"/)
      } else {
        const modePattern = new RegExp(`"mode": "${mode.replaceAll('/', '\\/')}"`)
        assert.match(source, modePattern)
      }
      assert.doesNotMatch(source, /\]\([^)]+\)/, `${language}/${file} must not depend on its location`)
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
