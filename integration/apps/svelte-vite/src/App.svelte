<main>
  <h1>Svelte + Vite</h1>
  <svg
    data-testid="icon"
    data-app="svelte-vite"
    aria-label="Check icon"
    viewBox="0 0 24 24"
  >
    <use href="/sprites/icons.sprite.svg#check"></use>
  </svg>
</main>

<style>
  :global(:root) {
    font-family: system-ui, sans-serif;
    color: #172033;
    background: #fff;
  }

  :global(body) {
    margin: 0;
    padding: 40px;
  }

  [data-testid='icon'] {
    width: 64px;
    height: 64px;
    color: #16a34a;
  }
</style>
