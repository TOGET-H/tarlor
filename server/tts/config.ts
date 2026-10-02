import { ttsVoices } from '../../shared/tts'

export const ttsRuntimeDefaults = {
  enabled: true, defaultChannel: 'edge', voice: 'zh-CN-YunxiNeural',
  rate: '+0%', meditationRate: '-15%', pitch: '+0Hz', timeoutMs: 30000, proxy: ''
}
export type TtsConfig = typeof ttsRuntimeDefaults
export class TtsError extends Error {
  constructor(public code: string, message: string, public statusCode = 502) { super(message) }
}
export function resolveTtsConfig(raw: unknown): TtsConfig {
  const input = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const config = { ...ttsRuntimeDefaults, ...input } as TtsConfig
  const enabled = input.enabled ?? true
  if (![true, false, 'true', 'false'].includes(enabled as boolean)) {
    throw new TtsError('INVALID_CONFIG', '语音服务配置无效', 500)
  }
  config.enabled = enabled === true || enabled === 'true'
  config.timeoutMs = Number(config.timeoutMs)
  if (config.defaultChannel !== 'edge' || !ttsVoices.some(voice => voice.id === config.voice)
      || !/^[+-](?:[0-4]?\d|50)%$/.test(config.rate)
      || !/^[+-](?:[0-4]?\d|50)%$/.test(config.meditationRate)
      || !/^[+-](?:[0-4]?\d|50)Hz$/.test(config.pitch)
      || !Number.isInteger(config.timeoutMs) || config.timeoutMs < 1000 || config.timeoutMs > 60000
      || typeof config.proxy !== 'string') throw new TtsError('INVALID_CONFIG', '语音服务配置无效', 500)
  if (config.proxy) {
    let url: URL
    try { url = new URL(config.proxy) } catch { throw new TtsError('INVALID_CONFIG', '语音代理配置无效', 500) }
    if (!['http:', 'https:'].includes(url.protocol)) throw new TtsError('INVALID_CONFIG', '语音代理配置无效', 500)
  }
  return config
}
