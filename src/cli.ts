#!/usr/bin/env node
import { CLI_USAGE, parseCliArgs } from './cli/parse-args.js'
import { generateSprite } from './generate.js'
import { log } from './logger.js'

async function main() {
  try {
    const args = parseCliArgs(process.argv.slice(2))

    if ('help' in args) {
      console.log(CLI_USAGE)
      return
    }

    await generateSprite(args.path, args.overrides)
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
