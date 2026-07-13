import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    browserName: 'chromium',
    headless: true,
  },
})
