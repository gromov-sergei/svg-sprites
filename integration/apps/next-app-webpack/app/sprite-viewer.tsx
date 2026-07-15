'use client'

import { SpriteViewer } from '@gromlab/svg-sprites/react'

const viewerSources = [
  () => import('../src/sprite/.svg-sprite/svg-sprite.manifest.js'),
] as const

export function AppSpriteViewer() {
  return <SpriteViewer sources={viewerSources} title="Next App Webpack Viewer" style={{ marginTop: 32 }} />
}
