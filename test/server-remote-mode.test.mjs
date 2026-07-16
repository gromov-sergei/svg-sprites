import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { once } from 'node:events'

import { generateSprite, isSpriteMode } from '../dist/index.js'

const CHECK_SVG = '<svg viewBox="0 0 24 24"><path fill="#16a34a" d="M9 16 4 11l2-2 3 3 8-8 2 2z"/></svg>'
const LOCAL_SVG = '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 1h14v14H1z"/></svg>'

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

async function startFixtureServer() {
  let releaseDir = null
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
    if (pathname === '/sources/check.svg') {
      response.setHeader('Content-Type', 'image/svg+xml')
      response.end(CHECK_SVG)
      return
    }
    if (pathname.startsWith('/release/') && releaseDir) {
      const filePath = path.join(releaseDir, path.basename(pathname))
      if (fs.existsSync(filePath)) {
        response.setHeader('Content-Type', filePath.endsWith('.json') ? 'application/json' : 'image/svg+xml')
        fs.createReadStream(filePath).pipe(response)
        return
      }
    }
    response.writeHead(404).end('Not found')
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Cannot start fixture server')
  return {
    origin: `http://127.0.0.1:${address.port}`,
    publish(directory) {
      releaseDir = directory
    },
    async close() {
      server.close()
      await once(server, 'close')
    },
  }
}

test('standalone@server publishes a release consumed by react@vite', async () => {
  assert.equal(isSpriteMode('standalone@server'), true)
  const fixtureServer = await startFixtureServer()

  try {
    const serverRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-server-'))
    const localDir = path.join(serverRoot, 'local')
    fs.mkdirSync(localDir)
    fs.writeFileSync(path.join(localDir, 'local.svg'), LOCAL_SVG)

    const serverResult = await generateSprite(serverRoot, {
      mode: 'standalone@server',
      name: 'icons',
      input: [
        './local/*.svg',
        {
          name: 'check',
          url: `${fixtureServer.origin}/sources/check.svg`,
          sha256: sha256(CHECK_SVG),
        },
      ],
      generatedNotice: false,
    })

    assert.equal(serverResult.target, 'server')
    assert.equal(serverResult.iconCount, 2)
    assert.equal(fs.existsSync(path.join(serverRoot, '.gitignore')), false)
    const releaseFiles = fs.readdirSync(serverResult.generatedDir).sort()
    assert.equal(releaseFiles.length, 3)
    assert.ok(releaseFiles.some((file) => /^sprite\.[a-f0-9]{16}\.svg$/.test(file)))
    assert.ok(releaseFiles.some((file) => /^sprite-root-viewbox\.[a-f0-9]{16}\.svg$/.test(file)))
    assert.ok(releaseFiles.includes('svg-sprite.manifest.json'))

    const manifest = JSON.parse(fs.readFileSync(serverResult.manifestPath, 'utf8'))
    assert.equal(manifest.kind, '@gromlab/svg-sprites/server')
    assert.equal(manifest.mode, 'standalone@server')
    assert.equal(manifest.name, 'icons')
    assert.equal(manifest.iconCount, 2)
    assert.deepEqual(manifest.icons.map(({ name }) => name), ['check', 'local'])
    assert.match(manifest.sprites.stack.href, /^\.\/sprite\.[a-f0-9]{16}\.svg$/)
    assert.match(manifest.sprites['stack-root-viewbox'].href, /^\.\/sprite-root-viewbox\.[a-f0-9]{16}\.svg$/)

    fixtureServer.publish(serverResult.generatedDir)
    const consumerRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-remote-react-'))
    const configPath = path.join(consumerRoot, 'svg-sprite.config.json')
    fs.writeFileSync(configPath, JSON.stringify({
      mode: 'react@vite',
      source: 'remote',
      input: `${fixtureServer.origin}/release/svg-sprite.manifest.json`,
    }))

    const consumerResult = await generateSprite(configPath)
    assert.equal(consumerResult.name, 'icons')
    assert.equal(consumerResult.iconCount, 2)
    assert.equal(consumerResult.target, 'vite')
    assert.match(fs.readFileSync(consumerResult.spritePath, 'utf8'), /id="check"/)
    assert.match(
      fs.readFileSync(path.join(consumerResult.generatedDir, 'react', 'react-component.js'), 'utf8'),
      /export const IconsIcon/,
    )
    assert.match(
      fs.readFileSync(path.join(consumerResult.generatedDir, 'icon-data.d.ts'), 'utf8'),
      /"check"/,
    )

    const previousSprite = fs.readFileSync(consumerResult.spritePath)
    manifest.sprites.stack.sha256 = '0'.repeat(64)
    fs.writeFileSync(path.join(serverResult.generatedDir, 'invalid-manifest.json'), JSON.stringify(manifest))
    await assert.rejects(
      generateSprite(consumerRoot, {
        mode: 'react@vite',
        source: 'remote',
        input: `${fixtureServer.origin}/release/invalid-manifest.json`,
      }),
      /SHA-256 does not match/,
    )
    assert.deepEqual(fs.readFileSync(consumerResult.spritePath), previousSprite)
  } finally {
    await fixtureServer.close()
  }
})

test('remote consumer rejects fields owned by standalone@server', async () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-sprites-remote-config-'))
  const configPath = path.join(rootDir, 'config.json')
  fs.writeFileSync(configPath, JSON.stringify({
    mode: 'react@vite',
    source: 'remote',
    input: 'https://example.test/manifest.json',
    transform: { replaceColors: false },
  }))
  await assert.rejects(generateSprite(configPath), /remote config does not support "transform"/)
})
