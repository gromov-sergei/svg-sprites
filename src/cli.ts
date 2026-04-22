#!/usr/bin/env node
import { loadConfig } from './config.js'
import { generate } from './generate.js'
import { log } from './logger.js'

async function main() {
  try {
    const config = await loadConfig()
    await generate(config)
  } catch (error) {
    log.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
