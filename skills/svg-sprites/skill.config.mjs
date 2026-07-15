const agentReferences = {
  en: [
    'complex-svg.md',
  ],
  ru: [
    'complex-svg.md',
  ],
}

function documents(language) {
  return [
    { entry: `src/${language}/SKILL.md`, to: 'SKILL.md', skill: true },
    ...agentReferences[language].map((file) => ({
      entry: `src/${language}/references/${file}`,
      to: `references/${file}`,
    })),
  ]
}

const englishDocumentation = [
  { from: '../../README.md', to: 'references/README.md' },
  {
    fromDirectory: '../../docs/en',
    toDirectory: 'references/docs/en',
    extensions: ['.md'],
    exclude: [
      'guides/AGENTS.md',
      'guides/README.md',
      'reference/README.md',
    ],
  },
]

const russianDocumentation = [
  { from: '../../README_RU.md', to: 'references/README_RU.md' },
  {
    fromDirectory: '../../docs/ru',
    toDirectory: 'references/docs/ru',
    extensions: ['.md'],
    exclude: [
      'guides/AGENTS.md',
      'guides/README.md',
      'reference/README.md',
    ],
  },
]

export default [
  {
    name: 'svg-sprites',
    description: 'Use only when configuring, generating, or troubleshooting @gromlab/svg-sprites. Triggers: @gromlab/svg-sprites, svg-sprite.config.json, svg-sprite.config.ts, defineSpriteConfig, generateSprite, standalone, standalone@vite, standalone@webpack, react@vite, react@webpack, next@app, next@pages, SpriteConfig.input, --input, SpriteViewer, or --icon-color-N. Do NOT use for custom SVG sprites, favicons, raster images, icon fonts, choosing an icon set, or inline SVG without this package.',
    output: '../artifacts/svg-sprites',
    maxSkillBytes: 48_000,
    documents: documents('en'),
    copy: englishDocumentation,
  },
  {
    name: 'svg-sprites-ru',
    description: 'Используй только при настройке, изменении или диагностике @gromlab/svg-sprites. Триггеры: @gromlab/svg-sprites, svg-sprite.config.json, svg-sprite.config.ts, defineSpriteConfig, generateSprite, standalone, standalone@vite, standalone@webpack, react@vite, react@webpack, next@app, next@pages, SpriteConfig.input, --input, SpriteViewer и --icon-color-N. НЕ используй для самописных SVG-спрайтов, inline SVG, favicon, растровых изображений, icon fonts или выбора библиотеки иконок.',
    output: '../artifacts/svg-sprites-ru',
    maxSkillBytes: 48_000,
    documents: documents('ru'),
    copy: russianDocumentation,
  },
]
