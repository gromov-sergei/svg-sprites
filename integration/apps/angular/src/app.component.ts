import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <h1>Angular</h1>
      <svg
        data-testid="icon"
        data-app="angular"
        aria-label="Check icon"
        viewBox="0 0 24 24"
      >
        <use href="/sprites/icons.sprite.svg#check"></use>
      </svg>
    </main>
  `,
})
export class AppComponent {}
