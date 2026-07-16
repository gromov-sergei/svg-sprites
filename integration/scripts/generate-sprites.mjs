import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const integrationRoot = path.resolve(import.meta.dirname, '..')
const sourcePath = path.join(integrationRoot, 'fixtures', 'icons', 'check.svg')
const releaseDir = path.join(
  integrationRoot,
  'apps',
  'standalone-server',
  'cases',
  'mixed-input',
  '.svg-sprite',
)

async function run(command, args, env) {
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: integrationRoot,
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.once('error', reject)
    child.once('exit', (code) => resolve(code ?? 1))
  })
  if (exitCode !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${exitCode}.`)
}

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
  if (pathname === '/sources/check.svg') {
    response.setHeader('Content-Type', 'image/svg+xml')
    fs.createReadStream(sourcePath).pipe(response)
    return
  }
  if (pathname.startsWith('/release/')) {
    const filePath = path.join(releaseDir, path.basename(pathname))
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      response.setHeader('Content-Type', filePath.endsWith('.json') ? 'application/json' : 'image/svg+xml')
      fs.createReadStream(filePath).pipe(response)
      return
    }
  }
  response.writeHead(404).end('Not found')
})

server.listen(0, '127.0.0.1')
await once(server, 'listening')

try {
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Cannot allocate integration source port.')
  const origin = `http://127.0.0.1:${address.port}`
  const sourceSha256 = createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex')

  await run('npm', [
    'run',
    'sprites',
    '--workspace',
    '@svg-sprites-fixtures/standalone-server',
  ], {
    SVG_SPRITE_SOURCE_ORIGIN: origin,
    SVG_SPRITE_SOURCE_SHA256: sourceSha256,
  })

  await run(process.execPath, [
    'scripts/run-workspaces.mjs',
    'sprites',
  ], {
    SVG_SPRITE_REMOTE_MANIFEST_URL: `${origin}/release/svg-sprite.manifest.json`,
  })
} finally {
  server.close()
  await once(server, 'close')
}
