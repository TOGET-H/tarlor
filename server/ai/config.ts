import { AiError } from './errors'
import type { AiChannel, AiConfig } from './types'

const presets: Record<string, { label: string; model: string; apiUrl: string }> = {
  siliconflow: {
    label: '硅基流动', model: 'Pro/zai-org/GLM-4.7',
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions'
  },
  deepseek: {
    label: 'DeepSeek', model: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/chat/completions'
  },
  glm: {
    label: '智谱 GLM', model: 'glm-4.7',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  }
}

function channelDefaults(label: string) {
  return { label, enabled: true, protocol: 'openai-compatible', apiKey: '', apiUrl: '', model: '',
    timeoutMs: 45000, temperature: 0.78, maxTokens: 900 }
}

// Empty connection defaults keep credentials out of build artifacts. NUXT_AI_* overrides at runtime.
export const aiRuntimeDefaults = {
  defaultChannel: 'siliconflow',
  fallbackToMock: true,
  channels: {
    siliconflow: channelDefaults('硅基流动'),
    deepseek: channelDefaults('DeepSeek'),
    glm: channelDefaults('智谱 GLM')
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function bool(value: unknown, fallback: boolean) {
  if (value === undefined || value === '') return fallback
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  throw new AiError('INVALID_CONFIG', 'AI 配置中的布尔值必须为 true 或 false', 500)
}

export function resolveAiConfig(runtime: unknown, legacyEnv: Record<string, string | undefined> = {}): AiConfig {
  const root = record(runtime)
  const input = record(root.ai)
  const entries = { ...aiRuntimeDefaults.channels, ...record(input.channels) }
  const channels: Record<string, AiChannel> = Object.create(null)
  for (const [id, value] of Object.entries(entries)) {
    if (!/^[a-z][a-z0-9_-]{0,63}$/.test(id)) {
      throw new AiError('INVALID_CONFIG', 'AI 通道标识格式无效', 500)
    }
    const channel = record(value)
    const preset = Object.hasOwn(presets, id) ? presets[id] : undefined
    const legacy = id === 'siliconflow' ? {
      apiKey: text(root.siliconflowApiKey) || text(legacyEnv.SILICONFLOW_API_KEY),
      model: text(root.siliconflowModel) || text(legacyEnv.SILICONFLOW_MODEL),
      apiUrl: text(root.siliconflowApiUrl) || text(legacyEnv.SILICONFLOW_API_URL)
    } : undefined
    channels[id] = {
      id, label: text(channel.label) || preset?.label || id,
      enabled: bool(channel.enabled, true), protocol: text(channel.protocol) || 'openai-compatible',
      apiKey: text(channel.apiKey) || legacy?.apiKey || '',
      model: text(channel.model) || legacy?.model || preset?.model || '',
      apiUrl: text(channel.apiUrl) || legacy?.apiUrl || preset?.apiUrl || '',
      timeoutMs: Number(channel.timeoutMs ?? 45000),
      temperature: Number(channel.temperature ?? 0.78),
      maxTokens: Number(channel.maxTokens ?? 900)
    }
  }
  return {
    defaultChannel: text(input.defaultChannel) || 'siliconflow',
    fallbackToMock: bool(input.fallbackToMock, true), channels
  }
}

export function validateChannel(channel: AiChannel) {
  if (!channel.enabled) throw new AiError('CHANNEL_DISABLED', '该 AI 通道已停用', 503)
  let url: URL
  try { url = new URL(channel.apiUrl) } catch {
    throw new AiError('INVALID_CONFIG', 'AI 通道地址配置无效', 500)
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash
      || !channel.model || channel.protocol !== 'openai-compatible'
      || !Number.isInteger(channel.timeoutMs) || channel.timeoutMs < 1 || channel.timeoutMs > 180000
      || !Number.isInteger(channel.maxTokens) || channel.maxTokens < 1 || channel.maxTokens > 65536
      || !Number.isFinite(channel.temperature) || channel.temperature < 0 || channel.temperature > 2) {
    throw new AiError('INVALID_CONFIG', 'AI 通道的协议、模型或请求参数配置无效', 500)
  }
  if (!channel.apiKey) throw new AiError('CHANNEL_UNCONFIGURED', '该 AI 通道尚未配置密钥', 503)
}
