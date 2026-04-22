import { useState, useRef, useEffect, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import cl from 'clsx'
import type { ColorPickerProps } from './types/color-picker.type'
import styles from './styles/color-picker.module.css'

/**
 * Выбор цвета с попапом react-colorful и HEX-инпутом.
 *
 * Используется для:
 *  - настройки CSS-переменных цвета иконок
 *  - визуального подбора цвета в модалке
 */
export const ColorPicker = (props: ColorPickerProps) => {
  const { value, onValueChange, label, className, ...htmlAttr } = props

  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const swatchRef = useRef<HTMLButtonElement>(null)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node

      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        swatchRef.current && !swatchRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const hex = e.target.value

    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onValueChange(hex)
    }
  }

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      <button
        ref={swatchRef}
        type="button"
        className={styles.swatch}
        style={{ backgroundColor: value }}
        onClick={handleToggle}
      />
      {label && <code className={styles.label}>{label}</code>}
      {isOpen && (
        <div ref={popoverRef} className={styles.popover}>
          <HexColorPicker color={value} onChange={onValueChange} />
          <input
            type="text"
            className={styles.hexInput}
            value={value}
            onChange={handleHexInput}
          />
        </div>
      )}
    </div>
  )
}
