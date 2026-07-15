import { spawn } from 'node:child_process'
import process from 'node:process'

import { apps } from './apps.mjs'

const script = process.argv[2]
const requestedApps = new Set(process.argv.slice(3))

if (!script) {
  throw new Error('Usage: node scripts/run-workspaces.mjs <script> [app ...]')
}

const selectedApps = requestedApps.size === 0
  ? apps
  : apps.filter(({ id }) => requestedApps.has(id))

for (const { id } of selectedApps) {
  console.log(`\n[${id}] npm run ${script}`)

  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script, '--workspace', `@svg-sprites-fixtures/${id}`, '--if-present'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    child.once('error', reject)
    child.once('exit', (code) => resolve(code ?? 1))
  })

  if (exitCode !== 0) process.exit(exitCode)
}
