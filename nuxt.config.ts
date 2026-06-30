export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  app: {
    head: {
      title: 'Digital Oracle',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ]
    }
  },
  dir: {
    public: 'public'
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  typescript: {
    typeCheck: true
  }
})
