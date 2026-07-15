'use client'

import { createElement, useEffect, useRef } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import type { SpriteViewerColorTheme, SpriteViewerSources } from '../viewer/types.js'

export type { SpriteViewerColorTheme } from '../viewer/types.js'

export type SpriteViewerProps = {
  sources: SpriteViewerSources
  title?: string
  /** Тема Viewer. По умолчанию следует prefers-color-scheme. */
  colorTheme?: SpriteViewerColorTheme
  /** Вызывается встроенным переключателем в controlled-режиме. */
  onColorThemeChange?: (theme: SpriteViewerColorTheme) => void
  className?: string
  style?: CSSProperties
}

type ViewerElement = HTMLElement & {
  sources: SpriteViewerSources
  viewerTitle: string
  colorTheme: SpriteViewerColorTheme
  themeControlled: boolean
  showThemeToggle: boolean
}

type ThemeChangeEvent = CustomEvent<{ theme: SpriteViewerColorTheme }>

/** React bridge к единому framework-neutral Viewer Web Component. */
export function SpriteViewer({
  sources,
  title = 'SVG Sprites',
  colorTheme,
  onColorThemeChange,
  className,
  style,
}: SpriteViewerProps): ReactElement {
  const elementRef = useRef<ViewerElement | null>(null)

  useEffect(() => {
    let active = true
    let element: ViewerElement | null = null

    const handleThemeChange = (event: Event) => {
      onColorThemeChange?.((event as ThemeChangeEvent).detail.theme)
    }

    void import('../viewer-element.js').then(async ({ defineSpriteViewerElement }) => {
      defineSpriteViewerElement()
      await customElements.whenDefined('gromlab-sprite-viewer')
      if (!active || !elementRef.current) return

      element = elementRef.current
      const wasThemeControlled = element.themeControlled
      element.sources = sources
      element.viewerTitle = title
      if (colorTheme !== undefined) element.colorTheme = colorTheme
      else if (wasThemeControlled) element.colorTheme = 'auto'
      element.themeControlled = colorTheme !== undefined
      element.showThemeToggle = colorTheme === undefined || onColorThemeChange !== undefined
      element.addEventListener('color-theme-change', handleThemeChange)
    })

    return () => {
      active = false
      element?.removeEventListener('color-theme-change', handleThemeChange)
    }
  }, [colorTheme, onColorThemeChange, sources, title])

  return createElement('gromlab-sprite-viewer', {
    ref: elementRef,
    className,
    style,
    'data-sprite-viewer-host': '',
  })
}
