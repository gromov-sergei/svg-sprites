import assert from 'node:assert/strict'
import test from 'node:test'

import {
  generateNextSprite,
  generateReactSprite,
} from '../dist/index.js'

test('generateReactSprite rejects unsupported targets', () => {
  assert.throws(
    () => generateReactSprite('.', 'unknown'),
    /Unsupported React asset target: unknown/,
  )
})

test('generateNextSprite rejects unsupported routers', async () => {
  await assert.rejects(
    generateNextSprite('.', { router: 'unknown', bundler: 'webpack' }),
    /Unsupported Next\.js router: unknown/,
  )
})

test('generateNextSprite rejects unsupported bundlers', async () => {
  await assert.rejects(
    generateNextSprite('.', { router: 'app', bundler: 'unknown' }),
    /Unsupported Next\.js bundler: unknown/,
  )
})
