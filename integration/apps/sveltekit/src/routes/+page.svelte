<svelte:head>
  <title>SvelteKit sprite fixture</title>
</svelte:head>

<main>
  <h1>SvelteKit</h1>
  <svg
    data-testid="icon"
    data-app="sveltekit"
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
