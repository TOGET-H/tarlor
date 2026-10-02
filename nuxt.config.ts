import { aiRuntimeDefaults } from './server/ai/config'
import { ttsRuntimeDefaults } from './server/tts/config'
import { createRequire } from 'node:module'

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
  css: ['~/assets/css/main.css', '~/assets/css/meditation.css'],
  runtimeConfig: {
    tts: ttsRuntimeDefaults,
    ai: aiRuntimeDefaults,
    // Keep legacy NUXT_SILICONFLOW_* runtime overrides during migration.
    siliconflowApiKey: '',
    siliconflowModel: '',
    siliconflowApiUrl: ''
  },
  devtools: { enabled: false },
  nitro: {
    externals: { external: ['edge-tts-universal'], traceInclude: [createRequire(import.meta.url).resolve('edge-tts-universal')] }
  },
  typescript: {
    typeCheck: true
  }
})
