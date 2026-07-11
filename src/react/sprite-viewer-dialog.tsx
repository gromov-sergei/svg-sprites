import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  generateViewerCode,
  highlightViewerCode,
  normalizeHexColor,
  tabsForFormat,
  viewBoxSize,
} from './sprite-viewer-code.js'
import type { SpriteViewerTab } from './sprite-viewer-code.js'
import type { SpriteManifest, SpriteManifestIcon } from './types.js'

type SpriteViewerDialogProps = {
  manifest: SpriteManifest
  icon: SpriteManifestIcon
  colorTheme: 'light' | 'dark'
  onClose: () => void
}

type ColorControlProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorControl({ label, value, onChange }: ColorControlProps) {
  const [open, setOpen] = useState(false)
  const swatchRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      const insideSwatch = swatchRef.current?.contains(target)
      const insidePopover = popoverRef.current?.contains(target)
      if (!insideSwatch && !insidePopover) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [open])

  return (
    <div className="gromlab-sprite-viewer__color-row">
      <button
        ref={swatchRef}
        className="gromlab-sprite-viewer__swatch"
        type="button"
        style={{ backgroundColor: value }}
        aria-label={`Изменить цвет ${label}`}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        title={`Изменить цвет ${label}`}
        onClick={() => setOpen((current) => !current)}
      />
      <code className="gromlab-sprite-viewer__color-label">{label}</code>
      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          className="gromlab-sprite-viewer__color-popover"
          role="dialog"
          aria-label={`Выбор цвета ${label}`}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            event.stopPropagation()
            setOpen(false)
          }}
        >
          <HexColorPicker color={value} onChange={onChange} />
          <HexColorInput
            className="gromlab-sprite-viewer__hex-input"
            color={value}
            onChange={onChange}
            prefixed
            aria-label={`HEX-значение ${label}`}
          />
        </div>
      )}
    </div>
  )
}

function initialColors(icon: SpriteManifestIcon, currentColor: string) {
  return Object.fromEntries(icon.colors.map(({ variable, fallback }) => [
    variable,
    normalizeHexColor(fallback, currentColor),
  ]))
}

export function SpriteViewerDialog({ manifest, icon, colorTheme, onClose }: SpriteViewerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const tabsId = useId()
  const tabs = tabsForFormat(manifest.format)
  const [activeTab, setActiveTab] = useState<SpriteViewerTab>('react')
  const themeColor = colorTheme === 'dark' ? '#e5e5e5' : '#1a1a1a'
  const [colors, setColors] = useState<Record<string, string>>(() => initialColors(icon, themeColor))
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({})
  const [cssColor, setCssColor] = useState(themeColor)
  const [cssColorOverridden, setCssColorOverridden] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
    }
  }, [icon])

  useEffect(() => {
    setColors({ ...initialColors(icon, themeColor), ...colorOverrides })
    if (!cssColorOverridden) setCssColor(themeColor)
  }, [colorTheme, icon])

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [copied])

  const previewStyle = Object.fromEntries(
    Object.entries(colors).map(([variable, color]) => [variable, color]),
  ) as CSSProperties
  const href = `${manifest.spriteUrl}#${icon.id}`
  const dimensions = viewBoxSize(icon.viewBox)
  const code = generateViewerCode({ manifest, icon, tab: activeTab, colorOverrides, cssColor })

  function handleColorChange(variable: string, color: string) {
    const normalized = normalizeHexColor(color)
    setColors((current) => ({ ...current, [variable]: normalized }))
    setColorOverrides((current) => ({ ...current, [variable]: normalized }))
  }

  function handleCssColorChange(color: string) {
    setCssColor(normalizeHexColor(color))
    setCssColorOverridden(true)
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const outside = event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom
    if (outside) onClose()
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, tabIndex: number) {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (tabIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (tabIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    setActiveTab(tabs[nextIndex].id)
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[nextIndex]?.focus()
  }

  async function copyCode() {
    if (!globalThis.navigator?.clipboard) return
    try {
      await globalThis.navigator.clipboard.writeText(code.code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function renderPreview() {
    if (activeTab === 'img') {
      return <img className="gromlab-sprite-viewer__dialog-img" src={href} alt={icon.name} />
    }
    if (activeTab === 'css') {
      return (
        <div
          className="gromlab-sprite-viewer__dialog-mask"
          role="img"
          aria-label={icon.name}
          style={{
            backgroundColor: cssColor,
            mask: `url('${href}') no-repeat center / contain`,
            WebkitMask: `url('${href}') no-repeat center / contain`,
          }}
        />
      )
    }
    return (
      <svg
        className="gromlab-sprite-viewer__dialog-icon"
        viewBox={icon.viewBox ?? undefined}
        aria-label={icon.name}
        role="img"
      >
        <use href={href} />
      </svg>
    )
  }

  return (
    <dialog
      ref={dialogRef}
      className="gromlab-sprite-viewer__dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
    >
      <div className="gromlab-sprite-viewer__dialog-shell">
        <button
          className="gromlab-sprite-viewer__close"
          type="button"
          aria-label="Закрыть"
          autoFocus
          onClick={onClose}
        >
          &#x2715;
        </button>

        <div className="gromlab-sprite-viewer__dialog-preview" style={previewStyle}>
          <div className="gromlab-sprite-viewer__dialog-preview-canvas">
            {renderPreview()}
          </div>
        </div>

        <div className="gromlab-sprite-viewer__dialog-heading">
          <h2 id={titleId} className="gromlab-sprite-viewer__dialog-title">{icon.name}</h2>
          {dimensions && <span className="gromlab-sprite-viewer__viewbox">{dimensions}</span>}
        </div>
        <p className="gromlab-sprite-viewer__dialog-meta">
          {manifest.name} · {manifest.format} · {manifest.target}
        </p>

        <div className="gromlab-sprite-viewer__colors">
          {(activeTab === 'react' || activeTab === 'svg') && icon.colors.length > 0 && (
            <>
              <p className="gromlab-sprite-viewer__hint">
                Цвета применяются к превью через CSS-переменные и попадут в пример кода.
              </p>
              <h3 className="gromlab-sprite-viewer__colors-title">CSS Variables</h3>
              {icon.colors.map(({ variable, fallback }) => (
                <ColorControl
                  key={variable}
                  value={colors[variable]}
                  label={`${variable}: ${fallback}`}
                  onChange={(color) => handleColorChange(variable, color)}
                />
              ))}
            </>
          )}
          {(activeTab === 'react' || activeTab === 'svg') && icon.colors.length === 0 && (
            <p className="gromlab-sprite-viewer__hint">У иконки нет настраиваемых цветовых переменных.</p>
          )}
          {activeTab === 'img' && (
            <p className="gromlab-sprite-viewer__hint">
              IMG изолирует SVG: CSS-переменные и currentColor внутрь изображения не передаются.
            </p>
          )}
          {activeTab === 'css' && (
            <>
              <p className="gromlab-sprite-viewer__hint">
                CSS mask отображает иконку одним цветом через background-color.
              </p>
              <ColorControl label="background-color" value={cssColor} onChange={handleCssColorChange} />
            </>
          )}
        </div>

        <div className="gromlab-sprite-viewer__tabs" role="tablist" aria-label="Способ подключения">
          {tabs.map((tab, tabIndex) => (
            <button
              id={`${tabsId}-${tab.id}-tab`}
              key={tab.id}
              className="gromlab-sprite-viewer__tab"
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabsId}-panel`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, tabIndex)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id={`${tabsId}-panel`}
          className="gromlab-sprite-viewer__code"
          role="tabpanel"
          aria-labelledby={`${tabsId}-${activeTab}-tab`}
        >
          <pre><code dangerouslySetInnerHTML={{ __html: highlightViewerCode(code.code, code.language) }} /></pre>
          <button className="gromlab-sprite-viewer__copy" type="button" onClick={() => void copyCode()}>
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
