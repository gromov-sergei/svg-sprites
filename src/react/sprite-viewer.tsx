'use client'

import { useDeferredValue, useEffect, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { SpriteViewerDialog } from './sprite-viewer-dialog.js'
import { SPRITE_VIEWER_STYLES } from './sprite-viewer-styles.js'
import type {
  SpriteManifest,
  SpriteManifestIcon,
  SpriteManifestLoader,
  SpriteManifestModule,
  SpriteViewerSource,
  SpriteViewerSources,
} from './types.js'

export type SpriteViewerColorTheme = 'auto' | 'light' | 'dark'

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

type SelectedIcon = {
  key: string
  manifest: SpriteManifest
  icon: SpriteManifestIcon
}

const manifestLoaderCache = new WeakMap<SpriteManifestLoader, Promise<SpriteManifest>>()

function compareManifests(left: SpriteManifest, right: SpriteManifest): number {
  return left.name < right.name ? -1 : left.name > right.name ? 1 : 0
}

function sourceArray(sources: SpriteViewerSources): readonly SpriteViewerSource[] {
  return Array.isArray(sources)
    ? sources
    : Object.values(sources as Readonly<Record<string, SpriteViewerSource>>)
}

function isSpriteManifest(value: unknown): value is SpriteManifest {
  if (!value || typeof value !== 'object') return false
  const manifest = value as Partial<SpriteManifest>
  return manifest.schemaVersion === 1
    && manifest.generator === '@gromlab/svg-sprites'
    && typeof manifest.name === 'string'
    && typeof manifest.componentName === 'string'
    && typeof manifest.spriteUrl === 'string'
    && Array.isArray(manifest.icons)
}

function manifestFromModule(value: SpriteManifest | SpriteManifestModule): SpriteManifest {
  if (isSpriteManifest(value)) return value
  if (isSpriteManifest(value.default)) return value.default
  if (isSpriteManifest(value.spriteManifest)) return value.spriteManifest
  throw new Error('The loaded module does not export a valid SVG sprite manifest.')
}

async function resolveSource(source: SpriteViewerSource): Promise<SpriteManifest> {
  if (typeof source !== 'function') return source

  const cached = manifestLoaderCache.get(source)
  if (cached) return cached

  const pending = Promise.resolve().then(source).then(manifestFromModule)
  manifestLoaderCache.set(source, pending)
  void pending.catch(() => {
    if (manifestLoaderCache.get(source) === pending) manifestLoaderCache.delete(source)
  })
  return pending
}

function directManifests(sources: SpriteViewerSources): SpriteManifest[] {
  return sourceArray(sources)
    .filter((source): source is SpriteManifest => typeof source !== 'function')
    .sort(compareManifests)
}

function countLabel(value: number, forms: readonly [string, string, string]): string {
  const modulo100 = value % 100
  const modulo10 = value % 10
  const form = modulo100 >= 11 && modulo100 <= 19
    ? forms[2]
    : modulo10 === 1
      ? forms[0]
      : modulo10 >= 2 && modulo10 <= 4
        ? forms[1]
        : forms[2]
  return `${value} ${form}`
}

function currentSystemTheme(): 'light' | 'dark' {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useSystemTheme(): 'light' | 'dark' {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(currentSystemTheme)

  useEffect(() => {
    const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    const update = () => setSystemTheme(media.matches ? 'dark' : 'light')
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return systemTheme
}

/** Интерактивный каталог локальных React- и Next.js-спрайтов. */
export function SpriteViewer({
  sources,
  title = 'SVG Sprites',
  colorTheme,
  onColorThemeChange,
  className,
  style,
}: SpriteViewerProps): ReactElement {
  const [manifests, setManifests] = useState<SpriteManifest[]>(() => directManifests(sources))
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(() => sourceArray(sources).some((source) => typeof source === 'function'))
  const [query, setQuery] = useState('')
  const [localColorTheme, setLocalColorTheme] = useState<SpriteViewerColorTheme>('auto')
  const [selected, setSelected] = useState<SelectedIcon | null>(null)
  const systemTheme = useSystemTheme()
  const activeColorTheme = colorTheme ?? localColorTheme
  const resolvedColorTheme = activeColorTheme === 'auto' ? systemTheme : activeColorTheme
  const canToggleTheme = colorTheme === undefined || onColorThemeChange !== undefined
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  useEffect(() => {
    let active = true
    const allSources = sourceArray(sources)
    const direct = directManifests(sources)
    const loaders = allSources.filter((source) => typeof source === 'function')

    setManifests(direct)
    setErrors([])
    setLoading(loaders.length > 0)
    setSelected(null)

    if (loaders.length === 0) return () => { active = false }

    Promise.allSettled(loaders.map(resolveSource)).then((results) => {
      if (!active) return

      const loaded: SpriteManifest[] = []
      const failures: string[] = []

      for (const result of results) {
        if (result.status === 'fulfilled') loaded.push(result.value)
        else failures.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
      }

      setManifests([...direct, ...loaded].sort(compareManifests))
      setErrors(failures)
      setLoading(false)
    })

    return () => { active = false }
  }, [sources])

  const visibleGroups = manifests
    .map((manifest) => ({
      manifest,
      icons: manifest.icons.filter((icon) => (
        deferredQuery === ''
        || icon.name.toLowerCase().includes(deferredQuery)
        || manifest.name.toLowerCase().includes(deferredQuery)
      )),
    }))
    .filter((group) => group.icons.length > 0)

  const totalIcons = manifests.reduce((total, manifest) => total + manifest.iconCount, 0)
  const visibleIcons = visibleGroups.reduce((total, group) => total + group.icons.length, 0)
  const rootClassName = ['gromlab-sprite-viewer', className].filter(Boolean).join(' ')

  function toggleTheme() {
    const nextTheme = resolvedColorTheme === 'dark' ? 'light' : 'dark'
    if (colorTheme === undefined) setLocalColorTheme(nextTheme)
    onColorThemeChange?.(nextTheme)
  }

  return (
    <section
      className={rootClassName}
      style={style}
      data-sprite-viewer=""
      data-theme={activeColorTheme === 'auto' ? undefined : activeColorTheme}
    >
      <style>{SPRITE_VIEWER_STYLES}</style>
      <header className="gromlab-sprite-viewer__header">
        <h1 className="gromlab-sprite-viewer__title">{title}</h1>
        <span className="gromlab-sprite-viewer__summary">
          {countLabel(manifests.length, ['спрайт', 'спрайта', 'спрайтов'])}
          {' · '}
          {countLabel(totalIcons, ['иконка', 'иконки', 'иконок'])}
          {deferredQuery && ` · найдено ${visibleIcons}`}
        </span>
        <div className="gromlab-sprite-viewer__toolbar">
          <input
            className="gromlab-sprite-viewer__search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Найти иконку"
            aria-label="Поиск иконок"
          />
          {canToggleTheme && (
            <button
              className="gromlab-sprite-viewer__theme"
              type="button"
              aria-label="Переключить тему"
              title="Переключить тему"
              onClick={toggleTheme}
            >
              &#x25D1;
            </button>
          )}
        </div>
      </header>

      {errors.length > 0 && (
        <div className="gromlab-sprite-viewer__errors" role="alert">
          {errors.map((error, index) => <div key={`${index}:${error}`}>{error}</div>)}
        </div>
      )}

      {visibleGroups.map(({ manifest, icons }) => (
        <section className="gromlab-sprite-viewer__group" key={`${manifest.name}:${manifest.spriteUrl}`}>
          <div className="gromlab-sprite-viewer__group-header">
            <h2 className="gromlab-sprite-viewer__group-title">{manifest.name}</h2>
            <span className="gromlab-sprite-viewer__badge">{manifest.format}</span>
            <span className="gromlab-sprite-viewer__group-count">{icons.length}</span>
            {manifest.description && (
              <p className="gromlab-sprite-viewer__description">{manifest.description}</p>
            )}
          </div>
          <div className="gromlab-sprite-viewer__grid">
            {icons.map((icon) => {
              const key = `${manifest.name}:${manifest.spriteUrl}:${icon.id}`
              return (
                <button
                  className="gromlab-sprite-viewer__card"
                  type="button"
                  key={key}
                  data-icon-name={icon.name}
                  onClick={() => setSelected({ key, manifest, icon })}
                  title={`Открыть ${icon.name}`}
                >
                  <span className="gromlab-sprite-viewer__icon-wrap">
                    <svg
                      className="gromlab-sprite-viewer__icon"
                      viewBox={icon.viewBox ?? undefined}
                      aria-hidden="true"
                    >
                      <use href={`${manifest.spriteUrl}#${icon.id}`} />
                    </svg>
                  </span>
                  <span className="gromlab-sprite-viewer__icon-name">{icon.name}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {visibleGroups.length === 0 && (!loading || manifests.length > 0) && (
        <div className="gromlab-sprite-viewer__status">
          {manifests.length === 0 ? 'Спрайты не подключены' : 'Иконки не найдены'}
        </div>
      )}
      {loading && manifests.length === 0 && (
        <div className="gromlab-sprite-viewer__status">Загрузка спрайтов...</div>
      )}

      <footer className="gromlab-sprite-viewer__footer">
        <span>@gromlab/svg-sprites</span>
        <a href="https://github.com/gromlab-ru/svg-sprites" target="_blank" rel="noreferrer">Repository</a>
      </footer>

      {selected && (
        <SpriteViewerDialog
          key={selected.key}
          manifest={selected.manifest}
          icon={selected.icon}
          colorTheme={resolvedColorTheme}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}
