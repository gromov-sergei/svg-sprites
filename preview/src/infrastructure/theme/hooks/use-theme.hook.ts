import { useState, useCallback, useEffect } from 'react'
import type { Theme } from '../types/theme.type'

const getSystemTheme = (): Theme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Управляет темой приложения: авто-определение по системе + ручное переключение.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getSystemTheme)

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      return next
    })
  }, [])

  useEffect(() => {
    // Устанавливаем data-theme при инициализации, чтобы CSS-селекторы
    // (включая подсветку кода) работали сразу, а не только после ручного переключения.
    document.documentElement.dataset.theme = getSystemTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (): void => {
      const next = getSystemTheme()
      document.documentElement.dataset.theme = next
      setTheme(next)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return { theme, toggle }
}
