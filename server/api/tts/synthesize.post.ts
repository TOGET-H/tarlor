import { createError, readBody, setHeader } from 'h3'
import { resolveTtsConfig, TtsError } from '../../tts/config'
import { ttsGateway } from '../../tts/gateway'

export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  try {
    const audio = await ttsGateway.synthesize(await readBody(event), resolveTtsConfig(useRuntimeConfig(event).tts))
    setHeader(event, 'Content-Type', 'audio/mpeg')
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    return Buffer.from(audio)
  } catch (error) {
    if (error instanceof TtsError) {
      if (error.statusCode === 429) setHeader(event, 'Retry-After', 3)
      throw createError({ statusCode: error.statusCode, statusMessage: 'Speech request failed',
        message: error.message, data: { code: error.code, message: error.message } })
    }
    throw error
  }
})
