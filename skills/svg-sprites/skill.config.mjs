const agentReferences = [
  'react-vite.md',
  'react-webpack.md',
  'next-app.md',
  'next-pages.md',
  'legacy.md',
  'migration-1.md',
  'programmatic-api.md',
  'complex-svg.md',
]

function documents(language) {
  return [
    { entry: `src/${language}/SKILL.md`, to: 'SKILL.md', skill: true },
    ...agentReferences.map((file) => ({
      entry: `src/${language}/references/${file}`,
      to: `references/${file}`,
    })),
  ]
}

const upstream = [
  { from: '../../README.md', to: 'references/upstream/README.md' },
  { from: '../../README_RU.md', to: 'references/upstream/README_RU.md' },
  {
    fromDirectory: '../../docs/en',
    toDirectory: 'references/upstream/docs/en',
    extensions: ['.md'],
  },
  {
    fromDirectory: '../../docs/ru',
    toDirectory: 'references/upstream/docs/ru',
    extensions: ['.md'],
  },
]

export default [
  {
    name: 'svg-sprites',
    description: 'Use only when configuring, generating, migrating, or troubleshooting @gromlab/svg-sprites. Triggers: @gromlab/svg-sprites, svg-sprite.config.ts, svg-sprites.config.ts, defineReactSpriteConfig, defineNextSpriteConfig, defineLegacyConfig, react@vite, react@webpack, next@app, next@pages, inputFiles, SpriteViewer, or --icon-color-N. Do NOT use for custom SVG sprites, favicons, raster images, icon fonts, choosing an icon set, or inline SVG without this package.',
    output: '../artifacts/svg-sprites',
    maxSkillBytes: 48_000,
    documents: documents('en'),
    copy: upstream,
  },
  {
    name: 'svg-sprites-ru',
    description: 'Используй только при настройке, изменении, миграции или диагностике @gromlab/svg-sprites. Триггеры: @gromlab/svg-sprites, svg-sprite.config.ts, svg-sprites.config.ts, defineReactSpriteConfig, defineNextSpriteConfig, defineLegacyConfig, react@vite, react@webpack, next@app, next@pages, inputFiles, SpriteViewer и --icon-color-N. НЕ используй для самописных SVG-спрайтов, inline SVG, favicon, растровых изображений, icon fonts или выбора библиотеки иконок.',
    output: '../artifacts/svg-sprites-ru',
    maxSkillBytes: 48_000,
    documents: documents('ru'),
    copy: upstream,
  },
]
