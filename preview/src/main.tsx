import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/styles/globals.css'
import { App } from './App'

function loadDevScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/dev-data.js'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function loadDevData(): Promise<void> {
  if (import.meta.env.DEV && !window.__SPRITES_DATA__) {
    await loadDevScript()
  }
}

loadDevData().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
