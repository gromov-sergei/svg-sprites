#!/usr/bin/env node
import path from 'node:path'
import { CLI_USAGE, parseCliArgs } from './cli/parse-args.js'
import { log } from './logger.js'
import { generateNextSprite } from './modes/next/generate.js'
import { generateReactSprite } from './modes/react/generate.js'
import { loadLegacyConfig } from './modes/legacy/config.js'
import { generateLegacy } from './modes/legacy/generate.js'

async function runLegacy(spritePath: string): Promise<void> {
  const rootDir = path.resolve(spritePath)
  const config = await loadLegacyConfig(rootDir)
  await generateLegacy(config)
}

async function main() {
  try {
    const args = parseCliArgs(process.argv.slice(2))

    if ('help' in args) {
      console.log(CLI_USAGE)
      return
    }

    switch (args.mode) {
      case 'legacy':
        await runLegacy(args.path)
        return
      case 'react':
        await generateReactSprite(args.path, args.target)
        return
      case 'next': {
        const [, routerAndBundler] = args.target.split('@')
        const [router, bundler] = routerAndBundler.split('/')
        await generateNextSprite(args.path, {
          router: router as 'app' | 'pages',
          bundler: bundler as 'turbopack' | 'webpack',
        })
        return
      }
    }
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
