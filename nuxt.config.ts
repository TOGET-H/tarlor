export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  app: {
    head: {
      title: '塔罗日记'
    }
  },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  typescript: {
    typeCheck: true
  }
})
