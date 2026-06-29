export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  app: {
    head: {
      title: 'Digital Oracle'
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
