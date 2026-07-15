<script setup>
import { IconsIcon } from '../src/sprite/index.js'
</script>

<template>
  <main>
    <h1>Nuxt + Webpack</h1>
    <IconsIcon
      data-testid="icon"
      data-app="nuxt-webpack"
      icon="check"
      aria-label="Check icon"
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
