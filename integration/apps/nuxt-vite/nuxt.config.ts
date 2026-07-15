export default defineNuxtConfig({
  compatibilityDate: '2026-07-01',
  devtools: { enabled: false },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'gromlab-sprite-viewer',
    },
  },
})
