import { useState, useEffect, useCallback, useRef } from 'react'
import cl from 'clsx'
import { CodeBlock } from '../code-block'
import { ColorPicker } from '../color-picker'
import { rgbToHex } from '../../shared/lib/rgb-to-hex.util'
import type { IconModalProps } from './types/icon-modal.type'
import styles from './styles/icon-modal.module.css'

type TabId = 'react' | 'svg' | 'img' | 'css'

const TABS: { id: TabId; label: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'svg', label: 'SVG' },
  { id: 'img', label: 'IMG' },
  { id: 'css', label: 'CSS' },
]

/**
 * Модалка деталей иконки с превью, color pickers и табами кода.
 *
 * Превью иконки рендерится тем же способом, что выбран в табе:
 *  - React / SVG — через <svg><use href>
 *  - IMG — через <img src>
 *  - CSS — через mask-image на <div>
 */
export const IconModal = (props: IconModalProps) => {
  const { icon, onClose, defaultSprite, className, ...htmlAttr } = props

  const [activeTab, setActiveTab] = useState<TabId>('react')
  const [colors, setColors] = useState<Record<string, string>>({})
  const [cssColor, setCssColor] = useState('#000000')
  const iconWrapRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (icon) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [icon, onClose])

  useEffect(() => {
    if (!icon) return

    const fg = getComputedStyle(document.documentElement).getPropertyValue('--color-fg').trim()
    const fgHex = rgbToHex(fg)

    const initialColors: Record<string, string> = {}
    icon.vars.forEach((v) => {
      initialColors[v.varName] = v.isCurrentColor ? fgHex : v.hex
    })

    setColors(initialColors)
    setCssColor(fgHex)
    setActiveTab('react')

    if (iconWrapRef.current) {
      iconWrapRef.current.removeAttribute('style')
    }
  }, [icon])

  if (!icon) {
    return null
  }

  const spriteRef = `${icon.spriteFile}#${icon.id}`

  const isDefaultSprite = icon.group === defaultSprite
  const codeReact = isDefaultSprite
    ? `<SvgSprite icon="${icon.id}" />`
    : `<SvgSprite icon="${icon.id}" sprite="${icon.group}" />`
  const codeSvg = `<svg width="24" height="24">\n  <use href="${spriteRef}"/>\n</svg>`
  const codeImg = `<img src="${spriteRef}" width="24" height="24" alt="${icon.id}">`
  const codeCss = `.${icon.id} {\n  width: 24px;\n  height: 24px;\n  mask: url('${spriteRef}') no-repeat center / contain;\n  -webkit-mask: url('${spriteRef}') no-repeat center / contain;\n  background-color: ${cssColor};\n}`

  const codeByTab: Record<TabId, { code: string; language: 'html' | 'css' }> = {
    react: { code: codeReact, language: 'html' },
    svg: { code: codeSvg, language: 'html' },
    img: { code: codeImg, language: 'html' },
    css: { code: codeCss, language: 'css' },
  }

  const handleColorChange = (varName: string, value: string): void => {
    setColors((prev) => ({ ...prev, [varName]: value }))
    iconWrapRef.current?.style.setProperty(varName, value)
  }

  const renderPreview = () => {
    switch (activeTab) {
      case 'react':
      case 'svg':
        return (
          <svg className={styles.icon}>
            <use href={`#${icon.id}`} />
          </svg>
        )

      case 'img':
        return (
          <img
            className={styles.iconImg}
            src={`${icon.spriteFile}#${icon.id}`}
            width={96}
            height={96}
            alt={icon.id}
          />
        )

      case 'css':
        return (
          <div
            className={styles.iconCss}
            style={{
              mask: `url('${icon.spriteFile}#${icon.id}') no-repeat center / contain`,
              WebkitMask: `url('${icon.spriteFile}#${icon.id}') no-repeat center / contain`,
              backgroundColor: cssColor,
            }}
          />
        )
    }
  }

  const supportsColorChange = activeTab === 'react' || activeTab === 'svg'
  const isMono = icon.vars.length > 0 && icon.vars.every((v) => v.isCurrentColor)

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div {...htmlAttr} className={cl(styles.root, className)}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          &#x2715;
        </button>

        <div ref={iconWrapRef} className={styles.iconWrap}>
          <div className={styles.iconViewBox}>
            {renderPreview()}
          </div>
        </div>

        <div className={styles.nameRow}>
          <div className={styles.name}>{icon.id}</div>
          {icon.viewBox && (
            <span className={styles.viewBoxBadge}>
              {icon.viewBox.width} &times; {icon.viewBox.height}
            </span>
          )}
        </div>

        <div className={styles.varsSection}>
          {icon.vars.length > 0 && supportsColorChange ? (
            <>
              <div className={styles.colorHint}>
                {isMono ? (
                  <span>
                    Иконка наследует цвет текста или задаётся точечно через CSS-переменную.
                  </span>
                ) : (
                  <span>
                    Многоцветная иконка — каждый цвет задаётся отдельной CSS-переменной.
                  </span>
                )}
              </div>
              <div className={styles.varsTitle}>CSS Variables</div>
              {icon.vars.map((v) => (
                <ColorPicker
                  key={v.varName}
                  value={colors[v.varName] || v.hex}
                  onValueChange={(color) => handleColorChange(v.varName, color)}
                  label={`${v.varName}: ${v.fallback}`}
                  className={styles.varRow}
                />
              ))}
            </>
          ) : activeTab === 'img' ? (
            <div className={styles.hint}>
              Управление цветом в режиме IMG невозможно. &lt;img&gt; изолирует SVG — CSS-переменные
              и currentColor не проникают внутрь. Подходит для многоцветных изображений с фиксированными цветами.
            </div>
          ) : activeTab === 'css' ? (
            <>
              <div className={styles.hint}>
                В режиме CSS mask иконка монохромная — цвет задаётся через background-color.
                CSS-переменные спрайта не поддерживаются.
              </div>
              <ColorPicker
                value={cssColor}
                onValueChange={setCssColor}
                label="background-color"
                className={styles.cssColorRow}
              />
            </>
          ) : (
            <span className={styles.noVars}>No color variables</span>
          )}
        </div>

        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cl(styles.tab, activeTab === tab.id && styles._active)}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={cl(styles.tabContent, activeTab === tab.id && styles._active)}
          >
            <CodeBlock
              code={codeByTab[tab.id].code}
              language={codeByTab[tab.id].language}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
