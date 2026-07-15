import { defineSpriteConfig } from '@gromlab/svg-sprites'

export default defineSpriteConfig({
  mode: 'standalone@webpack',
  name: 'icons',
  input: '../../../../fixtures/icons/check.svg',
  generatedNotice: false,
})
