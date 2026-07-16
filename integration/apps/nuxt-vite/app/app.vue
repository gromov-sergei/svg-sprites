<script setup>
import { AppIcon } from '../src/app-icons/index.js'
import { RemoteAppIcon } from '../src/remote-app-icons/index.js'
</script>

<template>
  <main>
    <h1>Nuxt + Vite</h1>
    <AppIcon
      data-testid="icon"
      data-app="nuxt-vite"
      icon="check"
      aria-label="Check icon"
      width="64"
      height="64"
      style="--icon-color-1: #16a34a"
    />
    <RemoteAppIcon
      data-testid="remote-icon"
      data-app="nuxt-vite-remote"
      icon="check"
      aria-label="Remote check icon"
      width="64"
      height="64"
      style="--icon-color-1: #16a34a"
    />
    <SpriteViewer />
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
