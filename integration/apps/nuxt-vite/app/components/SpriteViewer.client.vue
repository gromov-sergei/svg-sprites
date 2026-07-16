<script setup>
import { defineSpriteViewerElement } from '@gromlab/svg-sprites/viewer'

defineSpriteViewerElement()

const viewerSources = [
  () => import('../../src/app-icons/.svg-sprite/svg-sprite.manifest.js'),
  () => import('../../src/remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
]
</script>

<template>
  <gromlab-sprite-viewer
    :sources="viewerSources"
    viewer-title="Nuxt Vite Viewer"
  />
</template>
