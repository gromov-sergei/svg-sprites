<script setup>
import '@gromlab/svg-sprites/viewer/element'

import { AppIcon } from './app-icons/index.js'
import { RemoteAppIcon } from './remote-app-icons/index.js'

const viewerSources = [
  () => import('./app-icons/.svg-sprite/svg-sprite.manifest.js'),
  () => import('./remote-app-icons/.svg-sprite/svg-sprite.manifest.js'),
]
</script>

<template>
  <main>
    <h1>Vue + Vite</h1>
    <AppIcon
      data-testid="icon"
      data-app="vue-vite"
      icon="check"
      aria-label="Check icon"
      width="64"
      height="64"
      style="--icon-color-1: #16a34a"
    />
    <RemoteAppIcon
      data-testid="remote-icon"
      data-app="vue-vite-remote"
      icon="check"
      aria-label="Remote check icon"
      width="64"
      height="64"
      style="--icon-color-1: #16a34a"
    />
    <gromlab-sprite-viewer
      :sources="viewerSources"
      viewer-title="Vue Vite Viewer"
    />
  </main>
</template>

<style>
:root {
  font-family: system-ui, sans-serif;
  color: #172033;
  background: #fff;
}

body {
  margin: 0;
  padding: 40px;
}

gromlab-sprite-viewer {
  display: block;
  margin-top: 32px;
}
</style>
