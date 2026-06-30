const env = (
  globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>
    }
  }
).process?.env ?? {}

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
  runtimeConfig: {
    siliconflowApiKey: env.SILICONFLOW_API_KEY || '',
    siliconflowModel: env.SILICONFLOW_MODEL || 'Pro/zai-org/GLM-4.7',
    siliconflowApiUrl: env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/chat/completions'
  },
  devtools: { enabled: false },
  typescript: {
    typeCheck: true
  }
})
