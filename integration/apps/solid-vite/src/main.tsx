import { render } from 'solid-js/web'

import './style.css'

function App() {
  return (
    <main>
      <h1>Solid + Vite</h1>
      <svg
        data-testid="icon"
        data-app="solid-vite"
        aria-label="Check icon"
        viewBox="0 0 24 24"
      >
        <use href="/sprites/icons.sprite.svg#check" />
      </svg>
    </main>
  )
}

render(() => <App />, document.getElementById('root')!)
