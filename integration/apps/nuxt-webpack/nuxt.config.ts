export default defineNuxtConfig({
  compatibilityDate: '2026-07-01',
  devtools: { enabled: false },
  builder: 'webpack',
  nitro: {
    externals: {
      inline: ['entities'],
    },
  },
  hooks: {
    'webpack:config'(configs) {
      for (const config of configs) {
        const rules = config.module?.rules ?? []
        for (const rule of rules) {
          if (rule && typeof rule === 'object' && rule.test instanceof RegExp && rule.test.test('icon.svg')) {
            rule.exclude = rule.exclude ? [rule.exclude, /\.svg$/i] : /\.svg$/i
          }
        }
        rules.unshift({ test: /\.svg$/i, type: 'asset/resource' })
      }
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'gromlab-sprite-viewer',
    },
  },
})
