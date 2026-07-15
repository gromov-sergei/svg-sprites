import { mount } from 'svelte'

import App from './App.svelte'

const target = document.getElementById('app')
if (!target) throw new Error('Svelte mount target was not found.')

mount(App, {
  target,
})
