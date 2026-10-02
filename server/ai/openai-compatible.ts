import { AiError } from './errors'
import type { AiChannel, AiMessage, AiTextResult } from './types'

function responseContent(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (!Array.isArray(value)) return ''
  return value.map(part => part && typeof part === 'object'
    && (!part.type || part.type === 'text') && typeof part.text === 'string' ? part.text : '').join('').trim()
}

export async function generateCompatibleText(
  channel: AiChannel,
  messages: AiMessage[],
  transport: typeof fetch = fetch
): Promise<AiTextResult> {
  const signal = AbortSignal.timeout(channel.timeoutMs)
  try {
    const response = await transport(channel.apiUrl, {
      method: 'POST', redirect: 'error', signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${channel.apiKey}` },
      body: JSON.stringify({ model: channel.model, messages,
        temperature: channel.temperature, max_tokens: channel.maxTokens, stream: false })
    })
    // Never surface a provider's raw error body: it can contain request data or credentials.
    if (!response.ok) throw new AiError('UPSTREAM_ERROR', 'AI 服务暂时无法完成请求', 502, response.status)
    let data
    try { data = await response.json() } catch {
      if (signal.aborted) throw new AiError('TIMEOUT', 'AI 服务响应超时', 504)
      throw new AiError('INVALID_RESPONSE', 'AI 服务返回了无效响应', 502)
    }
    const content = responseContent(data?.choices?.[0]?.message?.content)
    if (!content) throw new AiError('EMPTY_RESPONSE', 'AI 服务未返回解读内容', 502)
    return { channel: channel.id, model: channel.model, content }
  } catch (error) {
    if (error instanceof AiError) throw error
    if (signal.aborted) throw new AiError('TIMEOUT', 'AI 服务响应超时', 504)
    throw new AiError('NETWORK_ERROR', 'AI 服务连接失败', 502)
  }
}
