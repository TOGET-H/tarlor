import { createHash } from 'node:crypto'
import { maxSpeechChunkLength, ttsVoices } from '../../shared/tts'
import { TtsError, type TtsConfig } from './config'
import { synthesizeEdgeSpeech, type TtsProvider } from './edge'

export function createTtsGateway(provider: TtsProvider = synthesizeEdgeSpeech, now = Date.now) {
  const cache = new Map<string, { audio: Uint8Array; expires: number }>()
  const pending = new Map<string, Promise<Uint8Array>>()
  let cacheBytes = 0
  function evict(key: string) { cacheBytes -= cache.get(key)?.audio.byteLength ?? 0; cache.delete(key) }
  return {
    async synthesize(raw: unknown, config: TtsConfig) {
      if (!config.enabled) throw new TtsError('TTS_DISABLED', '语音服务暂未开启', 503)
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TtsError('INVALID_INPUT', '语音请求格式无效', 400)
      const body = raw as Record<string, unknown>
      if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > maxSpeechChunkLength) {
        throw new TtsError('INVALID_TEXT', `每段语音需包含 1–${maxSpeechChunkLength} 个字符`, 400)
      }
      const channel = body.channel ?? config.defaultChannel
      if (channel !== 'edge') throw new TtsError('UNKNOWN_CHANNEL', '请选择有效的语音通道', 400)
      const voice = body.voice ?? config.voice
      if (!ttsVoices.some(option => option.id === voice)) throw new TtsError('INVALID_VOICE', '请选择有效的音色', 400)
      const purpose = body.purpose ?? 'reading'
      if (!['reading', 'meditation'].includes(purpose as string)) throw new TtsError('INVALID_PURPOSE', '语音用途无效', 400)
      const input = { text: body.text.trim(), voice: voice as string,
        rate: purpose === 'meditation' ? config.meditationRate : config.rate,
        pitch: config.pitch, timeoutMs: config.timeoutMs, proxy: config.proxy }
      const key = createHash('sha256').update(JSON.stringify([channel, input.text, input.voice, input.rate, input.pitch])).digest('hex')
      for (const [id, value] of cache) if (value.expires <= now()) evict(id)
      const cached = cache.get(key)
      if (cached) return cached.audio
      const existing = pending.get(key)
      if (existing) return existing
      if (pending.size >= 2) throw new TtsError('TTS_BUSY', '语音服务正忙，请稍后重试', 429)
      const request = Promise.resolve().then(() => provider(input)).then(audio => {
        if (!audio.byteLength || audio.byteLength > 2 * 1024 * 1024) throw new TtsError('TTS_FAILED', '语音服务返回的音频无效')
        while (cache.size >= 64 || cacheBytes + audio.byteLength > 16 * 1024 * 1024) evict(cache.keys().next().value!)
        cache.set(key, { audio, expires: now() + 10 * 60 * 1000 }); cacheBytes += audio.byteLength
        return audio
      }).catch(error => {
        if (error instanceof TtsError) throw error
        throw new TtsError('TTS_FAILED', '语音生成失败，请稍后重试')
      }).finally(() => pending.delete(key))
      pending.set(key, request)
      return request
    }
  }
}

export const ttsGateway = createTtsGateway()
