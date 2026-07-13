import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { IconsIcon } from './sprite'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <h1>React + Vite</h1>
      <IconsIcon
        data-testid="icon"
        data-app="react-vite"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
    </main>
  </StrictMode>,
)
