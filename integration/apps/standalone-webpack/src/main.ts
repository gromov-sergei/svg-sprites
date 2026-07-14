import spriteManifest from './sprite/.svg-sprite/svg-sprite.manifest.js'
import { getIconsIconHref, iconsSpriteUrl } from './sprite'

const check = spriteManifest.icons.find((icon) => icon.name === 'check')
if (!check || spriteManifest.spriteUrl !== iconsSpriteUrl) {
  throw new Error('Generated Webpack facade and manifest disagree.')
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Standalone + Webpack</h1>
  <svg
    data-testid="icon"
    data-app="standalone-webpack"
    viewBox="${check.viewBox ?? '0 0 24 24'}"
    aria-label="Check icon"
    style="width:64px;height:64px;color:#16a34a;--icon-color-1:#16a34a"
  >
    <use href="${getIconsIconHref('check')}"></use>
  </svg>
`
