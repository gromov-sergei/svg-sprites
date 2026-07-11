import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import test from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'

import { generateNextSprite } from '../dist/index.js'

const NEXT_BIN = path.resolve('node_modules/next/dist/bin/next')

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

function createNextFixture() {
  const rootDir = fs.mkdtempSync(path.join(path.resolve('test'), '.next-fixture-'))

  writeFile(
    path.join(rootDir, 'package.json'),
    JSON.stringify({ name: 'svg-sprites-next-fixture', private: true }, null, 2),
  )
  writeFile(
    path.join(rootDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        jsx: 'preserve',
        module: 'esnext',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
      },
    }, null, 2),
  )
  writeFile(
    path.join(rootDir, 'next-env.d.ts'),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n',
  )
  writeFile(
    path.join(rootDir, 'app', 'layout.tsx'),
    `export default function Layout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>
}
`,
  )
  writeFile(
    path.join(rootDir, 'app', 'page.tsx'),
    `import { AppIcon } from '../sprites/app'

export default function Page() {
  return <main><AppIcon icon="check" aria-label="App icon" style={{ '--icon-color-1': '#008000' }} /></main>
}
`,
  )
  writeFile(
    path.join(rootDir, 'pages', 'legacy.tsx'),
    `import { PagesIcon } from '../sprites/pages'

export default function LegacyPage() {
  return <main><PagesIcon icon="check" aria-label="Pages icon" style={{ '--icon-color-1': '#008000' }} /></main>
}

export function getServerSideProps() {
  return { props: {} }
}
`,
  )

  for (const name of ['app', 'pages']) {
    const spriteRoot = path.join(rootDir, 'sprites', name)
    writeFile(
      path.join(spriteRoot, 'svg-sprite.config.ts'),
      `export default { name: '${name}', generatedNotice: false }\n`,
    )
    writeFile(
      path.join(spriteRoot, 'icons', 'check.svg'),
      '<svg viewBox="0 0 16 16"><path d="M1 8l4 4L15 2" /></svg>',
    )
  }

  return rootDir
}

function runNext(rootDir, args) {
  const result = spawnSync(process.execPath, [NEXT_BIN, ...args], {
    cwd: rootDir,
    encoding: 'utf-8',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    maxBuffer: 10 * 1024 * 1024,
    timeout: 120_000,
  })

  assert.equal(
    result.status,
    0,
    [result.stdout, result.stderr, result.error?.message].filter(Boolean).join('\n'),
  )
}

async function getFreePort() {
  const server = net.createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const { port } = address
  server.close()
  await once(server, 'close')
  return port
}

async function startNext(rootDir) {
  const port = await getFreePort()
  const child = spawn(process.execPath, [NEXT_BIN, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: rootDir,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk })
  child.stderr.on('data', (chunk) => { output += chunk })
  const origin = `http://127.0.0.1:${port}`

  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before startup.\n${output}`)
    }

    try {
      const response = await fetch(origin)
      if (response.ok) return { child, origin }
    } catch {
      // Server is still starting.
    }

    await delay(100)
  }

  child.kill('SIGKILL')
  throw new Error(`Next.js did not start in time.\n${output}`)
}

async function stopNext(child) {
  if (child.exitCode !== null) return
  child.kill('SIGTERM')

  await Promise.race([
    once(child, 'exit'),
    delay(5_000).then(() => child.kill('SIGKILL')),
  ])
}

async function assertRenderedSprite(origin, route) {
  const response = await fetch(`${origin}${route}`)
  assert.equal(response.status, 200)
  const html = await response.text()
  const href = html.match(/href="([^"]+\.svg)#check"/)?.[1]

  assert.ok(href, `Sprite href not found in ${route}: ${html}`)
  assert.doesNotMatch(href, /^(?:data|file|blob):/)

  const spriteResponse = await fetch(new URL(href, origin))
  assert.equal(spriteResponse.status, 200)
  assert.match(spriteResponse.headers.get('content-type') ?? '', /image\/svg\+xml/)
  assert.match(await spriteResponse.text(), /id="check"/)
}

test('Next 16.2 renders App and Pages sprites with Turbopack and Webpack', { timeout: 300_000 }, async () => {
  const rootDir = createNextFixture()

  try {
    for (const bundler of ['turbopack', 'webpack']) {
      await generateNextSprite(path.join(rootDir, 'sprites', 'app'), {
        router: 'app',
        bundler,
      })
      await generateNextSprite(path.join(rootDir, 'sprites', 'pages'), {
        router: 'pages',
        bundler,
      })

      runNext(rootDir, ['build', `--${bundler}`])
      const { child, origin } = await startNext(rootDir)

      try {
        await assertRenderedSprite(origin, '/')
        await assertRenderedSprite(origin, '/legacy')
      } finally {
        await stopNext(child)
      }
    }
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true })
  }
})
