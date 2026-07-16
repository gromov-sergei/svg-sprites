import { isSpriteMode } from '../config.js'
import type { SpriteConfig, SpriteSource, TransformOptions } from '../types.js'
import type { CliArgs } from './types.js'

export const CLI_USAGE = [
  'Usage:',
  '  svg-sprites [options] <config-file-or-directory>',
  '',
  'Config files:',
  '  Any explicitly provided .js, .json or .ts file',
  '  A directory enables config-less generation from CLI options',
  '',
  'Modes:',
  '  standalone',
  '  standalone@vite',
  '  standalone@webpack',
  '  standalone@server',
  '  react@vite',
  '  react@webpack',
  '  vue@vite',
  '  vue@webpack',
  '  nuxt@vite',
  '  nuxt@webpack',
  '  svelte@vite',
  '  svelte@webpack',
  '  sveltekit@vite',
  '  angular@application',
  '  angular@webpack',
  '  astro@vite',
  '  solid@vite',
  '  solid@webpack',
  '  solid-start@vite',
  '  preact@vite',
  '  preact@webpack',
  '  qwik@vite',
  '  lit@vite',
  '  lit@webpack',
  '  alpine@vite',
  '  alpine@webpack',
  '  next@app/turbopack',
  '  next@app/webpack',
  '  next@pages/turbopack',
  '  next@pages/webpack',
  '',
  'Options:',
  '  --mode <mode>',
  '  --source <local|remote>',
  '  --name <name>',
  '  --description <text>',
  '  --input <path-or-glob>      Repeat for multiple inputs',
  '  --[no-]remove-size',
  '  --[no-]replace-colors',
  '  --[no-]add-transition',
  '  --[no-]generated-notice',
].join('\n')

function optionValue(argv: string[], index: number, option: string): [string, number] {
  const argument = argv[index]
  const inlinePrefix = `${option}=`
  if (argument.startsWith(inlinePrefix)) {
    const value = argument.slice(inlinePrefix.length)
    if (!value) throw new Error(`Missing value for ${option}.`)
    return [value, index]
  }

  const value = argv[index + 1]
  if (!value || value.startsWith('-')) throw new Error(`Missing value for ${option}.`)
  return [value, index + 1]
}

type MutableCliOverrides = {
  mode?: SpriteConfig['mode']
  source?: SpriteSource
  name?: string
  description?: string
  input?: string | string[]
  transform?: TransformOptions
  generatedNotice?: boolean
}

function setTransform(
  overrides: MutableCliOverrides,
  option: keyof TransformOptions,
  value: boolean,
): void {
  overrides.transform = {
    ...overrides.transform,
    [option]: value,
  }
}

export function parseCliArgs(argv: string[]): CliArgs | { help: true } {
  if (argv.includes('--help') || argv.includes('-h')) return { help: true }

  const positional: string[] = []
  const overrides: MutableCliOverrides = {}

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]

    if (argument === '--mode' || argument.startsWith('--mode=')) {
      const [value, nextIndex] = optionValue(argv, index, '--mode')
      if (!isSpriteMode(value)) throw new Error(`Unsupported sprite mode: ${value}.\n\n${CLI_USAGE}`)
      overrides.mode = value
      index = nextIndex
      continue
    }
    if (argument === '--source' || argument.startsWith('--source=')) {
      const [value, nextIndex] = optionValue(argv, index, '--source')
      if (value !== 'local' && value !== 'remote') {
        throw new Error(`Unsupported sprite source: ${value}. Expected local or remote.`)
      }
      overrides.source = value
      index = nextIndex
      continue
    }
    if (argument === '--name' || argument.startsWith('--name=')) {
      const [value, nextIndex] = optionValue(argv, index, '--name')
      overrides.name = value
      index = nextIndex
      continue
    }
    if (argument === '--description' || argument.startsWith('--description=')) {
      const [value, nextIndex] = optionValue(argv, index, '--description')
      overrides.description = value
      index = nextIndex
      continue
    }
    if (argument === '--input' || argument.startsWith('--input=')) {
      const [value, nextIndex] = optionValue(argv, index, '--input')
      const input = overrides.input === undefined
        ? []
        : Array.isArray(overrides.input) ? overrides.input : [overrides.input]
      overrides.input = [...input, value]
      index = nextIndex
      continue
    }

    switch (argument) {
      case '--remove-size':
        setTransform(overrides, 'removeSize', true)
        continue
      case '--no-remove-size':
        setTransform(overrides, 'removeSize', false)
        continue
      case '--replace-colors':
        setTransform(overrides, 'replaceColors', true)
        continue
      case '--no-replace-colors':
        setTransform(overrides, 'replaceColors', false)
        continue
      case '--add-transition':
        setTransform(overrides, 'addTransition', true)
        continue
      case '--no-add-transition':
        setTransform(overrides, 'addTransition', false)
        continue
      case '--generated-notice':
        overrides.generatedNotice = true
        continue
      case '--no-generated-notice':
        overrides.generatedNotice = false
        continue
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown argument: ${argument}\n\n${CLI_USAGE}`)
    }
    positional.push(argument)
  }

  if (positional.length === 0) {
    throw new Error(`Missing sprite config file or module directory.\n\n${CLI_USAGE}`)
  }
  if (positional.length > 1) {
    throw new Error(`Expected one config file or module directory, received: ${positional.join(', ')}`)
  }

  return {
    path: positional[0],
    overrides: overrides as SpriteConfig,
  }
}
