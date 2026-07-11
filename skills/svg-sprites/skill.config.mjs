const references = [
  { from: '../../README.md', to: 'references/README.md' },
  { from: '../../README_RU.md', to: 'references/README_RU.md' },
  { from: '../../docs/en/react-vite.md', to: 'references/docs/en/react-vite.md' },
  { from: '../../docs/en/react-webpack.md', to: 'references/docs/en/react-webpack.md' },
  { from: '../../docs/en/next-app.md', to: 'references/docs/en/next-app.md' },
  { from: '../../docs/en/next-pages.md', to: 'references/docs/en/next-pages.md' },
  { from: '../../docs/en/legacy.md', to: 'references/docs/en/legacy.md' },
  { from: '../../docs/en/migration-1.md', to: 'references/docs/en/migration-1.md' },
  { from: '../../docs/en/programmatic-api.md', to: 'references/docs/en/programmatic-api.md' },
  { from: '../../docs/ru/react-vite.md', to: 'references/docs/ru/react-vite.md' },
  { from: '../../docs/ru/react-webpack.md', to: 'references/docs/ru/react-webpack.md' },
  { from: '../../docs/ru/next-app.md', to: 'references/docs/ru/next-app.md' },
  { from: '../../docs/ru/next-pages.md', to: 'references/docs/ru/next-pages.md' },
  { from: '../../docs/ru/legacy.md', to: 'references/docs/ru/legacy.md' },
  { from: '../../docs/ru/migration-1.md', to: 'references/docs/ru/migration-1.md' },
  { from: '../../docs/ru/programmatic-api.md', to: 'references/docs/ru/programmatic-api.md' },
]

export default [
  {
    name: 'svg-sprites',
    description: 'Use when configuring, generating, migrating, or troubleshooting SVG sprites with @gromlab/svg-sprites. Triggers: SVG sprite, svg-sprites, svg-sprite.config.ts, svg-sprites.config.ts, defineReactSpriteConfig, defineNextSpriteConfig, react@vite, react@webpack, next@app, next@pages, inputFiles, SpriteViewer, icon="...", --icon-color-N, generated component, or an icon missing from preview or autocomplete. Do NOT use for favicons, raster images, icon fonts, choosing an icon set, or inline SVG without sprites.',
    source: 'src/SKILL.md',
    output: '../artifacts/svg-sprites',
    references,
  },
  {
    name: 'svg-sprites-ru',
    description: 'Используй при настройке, генерации, миграции или диагностике SVG-спрайтов через @gromlab/svg-sprites. Триггеры: SVG sprite, SVG-спрайт, svg-sprites, svg-sprite.config.ts, svg-sprites.config.ts, defineReactSpriteConfig, defineNextSpriteConfig, react@vite, react@webpack, next@app, next@pages, inputFiles, SpriteViewer, icon="...", --icon-color-N, generated-компонент или иконка не появилась в превью и автодополнении. НЕ используй для favicon, растровых изображений, icon fonts, выбора набора иконок или inline SVG без спрайтов.',
    source: 'src/SKILL_RU.md',
    output: '../artifacts/svg-sprites-ru',
    references,
  },
]
