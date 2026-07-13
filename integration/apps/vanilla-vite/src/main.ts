import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Vanilla + Vite</h1>
  <svg data-testid="icon" data-app="vanilla-vite" aria-label="Check icon" viewBox="0 0 24 24">
    <use href="/sprites/icons.sprite.svg#check"></use>
  </svg>
`
