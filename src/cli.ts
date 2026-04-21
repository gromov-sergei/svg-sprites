#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { generate } from './generate.js'
import { log } from './logger.js'

const main = defineCommand({
  meta: {
    name: 'svg-sprites',
    version: '0.1.0',
    description: 'Generate SVG sprites and TypeScript icon name types',
  },
  args: {
    input: {
      type: 'string',
      alias: 'i',
      description: 'Directory with SVG subfolders (each subfolder = one sprite)',
      required: true,
    },
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output directory for generated SVG sprite files',
      required: true,
    },
    types: {
      type: 'boolean',
      alias: 't',
      description: 'Generate TypeScript union types for icon names (default: true)',
      default: true,
    },
    typesOutput: {
      type: 'string',
      description: 'Output directory for .generated.ts files (default: same as input)',
    },
    removeSize: {
      type: 'boolean',
      description: 'Remove width/height from root <svg> (default: true)',
      default: true,
    },
    replaceColors: {
      type: 'boolean',
      description: 'Replace colors with CSS variables var(--icon-color-N) (default: true)',
      default: true,
    },
    addTransition: {
      type: 'boolean',
      description: 'Add transition:fill,stroke to colored elements (default: true)',
      default: true,
    },
    preview: {
      type: 'boolean',
      alias: 'p',
      description: 'Generate HTML preview page with all icons (default: true)',
      default: true,
    },
  },
  async run({ args }) {
    try {
      await generate({
        input: args.input,
        output: args.output,
        types: args.types,
        typesOutput: args.typesOutput,
        transform: {
          removeSize: args.removeSize,
          replaceColors: args.replaceColors,
          addTransition: args.addTransition,
        },
        preview: args.preview,
      })
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  },
})

runMain(main)
