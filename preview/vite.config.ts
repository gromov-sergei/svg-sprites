import { resolve } from 'node:path'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

/** Переименовывает index.html → preview-template.html после сборки. */
function renameOutput(): Plugin {
  return {
    name: 'rename-preview-template',
    closeBundle() {
      const outDir = resolve(__dirname, '../dist')
      const src = resolve(outDir, 'index.html')
      const dest = resolve(outDir, 'preview-template.html')

      if (existsSync(src)) {
        const content = readFileSync(src, 'utf-8')
        writeFileSync(dest, content)
        unlinkSync(src)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), viteSingleFile(), renameOutput()],
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
  },
})
