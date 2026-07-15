<script setup>
import { defineSpriteViewerElement } from '@gromlab/svg-sprites/viewer'

defineSpriteViewerElement()

const viewerSources = [
  () => import('../../src/sprite/.svg-sprite/svg-sprite.manifest.js'),
]
</script>

<template>
  <gromlab-sprite-viewer
    :sources="viewerSources"
    viewer-title="Nuxt Vite Viewer"
  />
</template>
