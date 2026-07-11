import type { NextAssetTarget, ReactAssetTarget } from '../targets/types.js'
import type { CliArgs } from './types.js'

const REACT_TARGETS = new Set<ReactAssetTarget>(['vite', 'webpack'])
const NEXT_TARGETS = new Set<NextAssetTarget>([
  'next@app/turbopack',
  'next@app/webpack',
  'next@pages/turbopack',
  'next@pages/webpack',
])

export const CLI_USAGE = [
  'Usage:',
  '  svg-sprites --mode <mode> <path>',
  '',
  'Modes:',
  '  legacy          Generate sprites through the legacy pipeline',
  '  react@vite      Generate a React module for Vite',
  '  react@webpack   Generate a React module for Webpack 5',
  '  next@app/turbopack    Generate an App Router module for Turbopack',
  '  next@app/webpack      Generate an App Router module for Webpack 5',
  '  next@pages/turbopack  Generate a Pages Router module for Turbopack',
  '  next@pages/webpack    Generate a Pages Router module for Webpack 5',
].join('\n')

export function parseCliArgs(argv: string[]): CliArgs | { help: true } {
  if (argv.includes('--help') || argv.includes('-h')) {
    return { help: true }
  }

  let modeValue: string | undefined
  const positional: string[] = []

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]

    if (argument === '--mode') {
      modeValue = argv[index + 1]
      index++
      continue
    }

    if (argument.startsWith('--mode=')) {
      modeValue = argument.slice('--mode='.length)
      continue
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown argument: ${argument}\n\n${CLI_USAGE}`)
    }

    positional.push(argument)
  }

  if (!modeValue) {
    throw new Error(`Missing required argument: --mode\n\n${CLI_USAGE}`)
  }

  if (positional.length === 0) {
    throw new Error(`Missing sprite path.\n\n${CLI_USAGE}`)
  }

  if (positional.length > 1) {
    throw new Error(`Expected one sprite path, received: ${positional.join(', ')}`)
  }

  if (modeValue === 'legacy') {
    return {
      mode: 'legacy',
      path: positional[0],
    }
  }

  if (modeValue === 'react') {
    throw new Error(
      'React mode requires a target. Supported: react@vite, react@webpack.',
    )
  }

  if (modeValue.startsWith('react@')) {
    const target = modeValue.slice('react@'.length)

    if (!REACT_TARGETS.has(target as ReactAssetTarget)) {
      throw new Error(
        `Unsupported React target: ${target}. Supported: ${[...REACT_TARGETS].join(', ')}.`,
      )
    }

    return {
      mode: 'react',
      path: positional[0],
      target: target as ReactAssetTarget,
    }
  }

  if (modeValue === 'next') {
    throw new Error(
      `Next.js mode requires a router and bundler. Supported: ${[...NEXT_TARGETS].join(', ')}.`,
    )
  }

  if (modeValue.startsWith('next@')) {
    if (!NEXT_TARGETS.has(modeValue as NextAssetTarget)) {
      throw new Error(
        `Unsupported Next.js target: ${modeValue}. Supported: ${[...NEXT_TARGETS].join(', ')}.`,
      )
    }

    return {
      mode: 'next',
      path: positional[0],
      target: modeValue as NextAssetTarget,
    }
  }

  throw new Error(
    `Unknown mode: ${modeValue}\nSupported modes: legacy, react@vite, react@webpack, ${[...NEXT_TARGETS].join(', ')}`,
  )
}
