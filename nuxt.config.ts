export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  app: {
    head: {
      title: 'Digital Oracle'
    }
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  typescript: {
    typeCheck: true
  }
})
