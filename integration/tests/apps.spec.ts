import { spawn, type ChildProcess } from 'node:child_process'
import { once } from 'node:events'
import net from 'node:net'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'

import { apps } from '../scripts/apps.mjs'

const integrationRoot = path.resolve(import.meta.dirname, '..')

async function getFreePort(): Promise<number> {
  const server = net.createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Cannot allocate a test port')
  server.close()
  await once(server, 'close')
  return address.port
}

function startServer(app: (typeof apps)[number], port: number): ChildProcess {
  const appRoot = path.join(integrationRoot, 'apps', app.id)
  let command: string[]
  let cwd = integrationRoot

  switch (app.kind) {
    case 'next':
      cwd = appRoot
      command = [path.join(integrationRoot, 'node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)]
      break
    case 'nuxt':
      cwd = appRoot
      command = [path.join(appRoot, '.output/server/index.mjs')]
      break
    case 'sveltekit':
      cwd = appRoot
      command = [path.join(appRoot, 'build/index.js')]
      break
    default:
      command = [path.join(integrationRoot, 'scripts/serve-static.mjs'), path.join(appRoot, app.output), String(port)]
  }

  return spawn(process.execPath, command, {
    cwd,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      HOSTNAME: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
      NITRO_PORT: String(port),
      PORT: String(port),
      NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function waitForServer(child: ChildProcess, origin: string): Promise<void> {
  let output = ''
  child.stdout?.on('data', (chunk) => { output += String(chunk) })
  child.stderr?.on('data', (chunk) => { output += String(chunk) })

  for (let attempt = 0; attempt < 200; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server exited before startup:\n${output}`)

    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {
      // Server is still starting.
    }

    await delay(100)
  }

  throw new Error(`Server did not start:\n${output}`)
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return
  child.kill('SIGTERM')
  await Promise.race([
    once(child, 'exit'),
    delay(5_000).then(() => child.kill('SIGKILL')),
  ])
}

for (const app of apps) {
  test(`${app.id} renders an external generated sprite`, async ({ page }) => {
    const port = await getFreePort()
    const origin = `http://127.0.0.1:${port}`
    const server = startServer(app, port)
    const browserErrors: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })
    page.on('pageerror', (error) => browserErrors.push(error.message))

    try {
      await waitForServer(server, origin)
      await page.goto(origin)

      const icon = page.getByTestId('icon')
      await expect(icon).toBeVisible()
      await expect(icon).toHaveAttribute('data-app', app.id)

      const href = await icon.locator('use').getAttribute('href')
      expect(href).toBeTruthy()
      expect(href).not.toMatch(/^(?:blob|data|file):/)

      const spriteUrl = new URL(href!.split('#')[0], page.url())
      if ('expectedSpritePath' in app) {
        expect(spriteUrl.pathname).toBe(app.expectedSpritePath)
      }
      const spriteResponse = await fetch(spriteUrl)
      expect(spriteResponse.status).toBe(200)
      expect(spriteResponse.headers.get('content-type') ?? '').toMatch(/image\/svg\+xml/)
      expect(await spriteResponse.text()).toMatch(/id="check"/)

      const screenshot = PNG.sync.read(await icon.screenshot())
      let coloredPixels = 0
      for (let index = 0; index < screenshot.data.length; index += 4) {
        const [red, green, blue, alpha] = screenshot.data.subarray(index, index + 4)
        if (alpha > 0 && green > red + 30 && green > blue + 30) coloredPixels++
      }
      expect(coloredPixels).toBeGreaterThan(20)
      expect(browserErrors).toEqual([])
    } finally {
      await stopServer(server)
    }
  })
}
