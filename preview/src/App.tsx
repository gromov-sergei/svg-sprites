import { useState, useMemo } from 'react'
import { useTheme } from './infrastructure/theme'
import { Banner } from './ui/banner'
import { SearchInput } from './ui/search-input'
import { IconGrid } from './ui/icon-grid'
import { IconModal } from './ui/icon-modal'
import type { SpritesData, IconData } from './shared/types'
import styles from './app/styles/app.module.css'

declare global {
  interface Window {
    __SPRITES_DATA__?: SpritesData
  }
}

const MOCK_DATA: SpritesData = {
  groups: [],
}

/**
 * Корневой компонент превью SVG-спрайтов.
 *
 * Используется для:
 *  - отображения всех иконок из сгенерированных спрайтов
 *  - просмотра деталей иконки и кода использования
 */
export const App = () => {
  const { toggle } = useTheme()
  const data = window.__SPRITES_DATA__ ?? MOCK_DATA
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null)

  const isFileProtocol = location.protocol === 'file:'

  const totalIcons = useMemo(
    () => data.groups.reduce((sum, g) => sum + g.icons.length, 0),
    [data.groups],
  )

  const selectedIcon = useMemo((): IconData | null => {
    if (!selectedIconId) {
      return null
    }

    for (const group of data.groups) {
      const found = group.icons.find((i) => i.id === selectedIconId)
      if (found) {
        return found
      }
    }

    return null
  }, [selectedIconId, data.groups])

  const handleCloseModal = (): void => {
    setSelectedIconId(null)
  }

  return (
    <>
      {isFileProtocol && (
        <Banner variant="warn">
          <strong>file://</strong> — Preview opened from local file. External SVG
          references won&apos;t work in code snippets. Use a local server for full
          functionality.
        </Banner>
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>SVG Sprites</h1>
        <span className={styles.count}>{totalIcons} icons</span>
        <div className={styles.toolbar}>
          <SearchInput
            placeholder="Search icons..."
            onValueChange={setSearchQuery}
          />
          <button type="button" className={styles.themeButton} onClick={toggle}>
            &#x25D1;
          </button>
        </div>
      </header>

      <IconGrid
        groups={data.groups}
        searchQuery={searchQuery}
        onIconSelect={setSelectedIconId}
      />

      <IconModal
        icon={selectedIcon}
        defaultSprite={data.groups[0]?.name}
        onClose={handleCloseModal}
      />

      <footer className={styles.footer}>
        <span className={styles.footerText}>@gromlab/svg-sprites</span>
        <a
          className={styles.footerLink}
          href="https://gromlab.ru/gromov/svg-sprites"
          target="_blank"
          rel="noreferrer"
        >
          Repository
        </a>
      </footer>
    </>
  )
}
